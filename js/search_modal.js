(function ($, Drupal) {
  Drupal.behaviors.openaiWebSearch = {
    attach: function (context, settings) {
      once('web-search', '#run-search', context).forEach(function (button) {
        button.addEventListener('click', function () {
          const query = document.querySelector('#edit-title-0-value')?.value;
          const limit = document.querySelector('#search-limit').value;

          if (!query) return;

          document.querySelector('#search-results').innerHTML = '<p>Searching...</p>';

          fetch('/openai-web-search/run?query=' + encodeURIComponent(query) + '&limit=' + limit)
            .then(res => res.json())
            .then(data => {
              let html = '<ul class="search-results">';
              data.results.forEach(item => {
                html += `<li style="margin-bottom:1em;">
            <a href="${item.url}" target="_blank" rel="noopener" style="font-weight:bold;">${item.title}</a><br/>
            <small>${item.description}</small>
          </li>`;
              });
              html += '</ul>';
              document.querySelector('#search-results').innerHTML = html;
            });
        });
      });
    }
  };
})(jQuery, Drupal);
