<?php

namespace Drupal\openai_web_search_assist\Service;

use Drupal\Core\KeyValueStore\KeyValueFactoryInterface;
use Drupal\key\KeyRepositoryInterface;
use GuzzleHttp\Client;

class OpenAISearchService {

  protected $client;
  protected $apiKey;

  public function __construct(KeyRepositoryInterface $key_repository) {
    $this->apiKey = $key_repository->getKey('openai_key')->getKeyValue();
    $this->client = new Client(['base_uri' => 'https://api.openai.com/v1/']);
  }

  public function searchWeb($query) {
    $response = $this->client->post('chat/completions', [
      'headers' => [
        'Authorization' => 'Bearer ' . $this->apiKey,
        'OpenAI-Beta' => 'assistants=v2', // still required for browser tool
        'Content-Type' => 'application/json',
      ],
      'json' => [
        'model' => 'gpt-4o',
        'messages' => [
          ['role' => 'user', 'content' => "Search the web for news articles related to: \"$query\". Summarize top 3 results in bullet points with title, short description, and thumbnail if available."]
        ],
        'tools' => [
          ['type' => 'browser']
        ],
        'tool_choice' => 'auto'
      ]
    ]);

    $data = json_decode($response->getBody(), true);

    // Safety: default fallback
    $results = [];

    if (isset($data['choices'][0]['message']['content'])) {
      $content = $data['choices'][0]['message']['content'];
      // Split response into array, naive parsing. You may parse better.
      $lines = explode("\n", $content);
      foreach ($lines as $line) {
        if (trim($line)) {
          $results[] = [
            'title' => strip_tags($line),
            'description' => '', // Optionally parse more from line
            'thumbnail' => 'https://via.placeholder.com/80x60',
          ];
        }
      }
    }

    return $results;
  }
}
