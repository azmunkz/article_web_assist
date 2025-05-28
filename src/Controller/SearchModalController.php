<?php
namespace Drupal\openai_web_search_assist\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\HtmlResponse;
use Drupal\Core\Render\Markup;
use Drupal\key\KeyRepositoryInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class SearchModalController extends ControllerBase {

  public function modal() {
    return [
      '#type' => 'inline_template',
      '#template' => '
          <div id="openai-search-container" style="padding: 1rem;">
            <p><strong>Searching for related news based on this article title.</strong></p>
            <button id="run-search" style="margin-bottom: 10px;">Search Now</button>
            <div id="search-results" style="margin-top: 1rem;"></div>
          </div>',
      '#attached' => [
        'library' => ['openai_web_search_assist/modal_sweetalert'],
      ],
    ];
  }

  public function runSearch(Request $request) {
    $query = $request->query->get('query');

    $api_key = \Drupal::service('key.repository')->getKey('openai_key')->getKeyValue();
    $client = \Drupal::httpClient();
    $limit = max(1, min((int) $request->query->get('limit', 3), 10));

    try {
      $response = $client->post('https://api.openai.com/v1/chat/completions', [
        'headers' => [
          'Authorization' => 'Bearer ' . $api_key,
          'Content-Type' => 'application/json',
        ],
        'json' => [
          'model' => 'gpt-4o-search-preview',
          'messages' => [
            [
              'role' => 'user',
              'content' => "You are a search assistant. Search the web for the top $limit most relevant news articles about: \"$query\".
                Return ONLY a JSON array. Each item MUST include the following keys:
                - title (string)
                - url (string)
                - description (string, short paragraph)
                - published_date (string, e.g. 'May 22, 2025')
                - relevance (number from 1 to 10)
                - source (string, e.g. 'BBC', 'Reuters')

                IMPORTANT:
                - Do not include markdown, explanation or extra text.
                - Response must be raw JSON array ONLY, no key wrapping.

                Example format:
                [
                  {
                    \"title\": \"...\",
                    \"url\": \"https://...\",
                    \"description\": \"...\",
                    \"published_date\": \"May 22, 2025\",
                    \"relevance\": 8,
                    \"source\": \"BBC\"
                  }
                ]"
            ],
          ],
          'web_search_options' => new \stdClass(),
        ],
      ]);

      $data = json_decode($response->getBody(), true);
      $content = $data['choices'][0]['message']['content'] ?? '';

      try {
        $json = json_decode($content, true);

        \Drupal::logger('openai_web_search_assist')->notice('<pre>' . print_r($json, TRUE) . '</pre>');

        $results = [];

        if (is_array($json)) {
          foreach ($json as $item) {
            $results[] = [
              'title' => $item['title'] ?? '(no title)',
              'url' => $item['url'] ?? '#',
              'description' => $item['description'] ?? '',
              'published_date' => $item['published_date'] ?? '',
              'relevance' => $item['relevance'] ?? 0,
              'source' => $item['source'] ?? 'Unknown',
            ];
          }
        }

        if (empty($results)) {
          $results[] = [
            'title' => 'No valid results returned.',
            'url' => '#',
          ];
        }

        return new JsonResponse(['results' => $results]);
      }
      catch (\Throwable $e) {
        \Drupal::logger('openai_web_search_assist')->error('OpenAI parse error: ' . $e->getMessage());
        return new JsonResponse([
          'results' => [[
            'title' => 'Failed to parse OpenAI response.',
            'url' => '#',
          ]],
        ]);
      }
    }
    catch (\Throwable $e) {
      \Drupal::logger('openai_web_search_assist')->error('OpenAI API error: ' . $e->getMessage());
      return new JsonResponse([
        'results' => [[
          'title' => 'Error contacting OpenAI.',
          'url' => '#',
        ]],
      ]);
    }
  }

}
