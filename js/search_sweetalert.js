(function ($, Drupal) {
  Drupal.behaviors.openaiWebSearch = {
    attach: function (context, settings) {
      once('sweet-search', '#sweet-search-trigger', context).forEach(function (button) {
        button.addEventListener('click', function () {
          Swal.fire({
            title: 'Search Related News',
            html: `
              <input type="text" id="search-term" class="swal2-input" placeholder="e.g. AI in Malaysia">
              <select id="search-limit" class="swal2-select" style="margin-top:10px;">
                <option value="3" selected>3 results</option>
                <option value="5">5 results</option>
                <option value="7">7 results</option>
              </select>
            `,
            confirmButtonText: 'Search',
            showCancelButton: true,
            showLoaderOnConfirm: true,
            preConfirm: () => {
              const query = document.getElementById('search-term').value;
              const limit = document.getElementById('search-limit').value;

              if (!query) {
                Swal.showValidationMessage('Please enter a topic');
                return false;
              }

              return fetch('/openai-web-search/run?query=' + encodeURIComponent(query) + '&limit=' + limit)
                .then(res => res.json())
                .then(data => {
                  let html = '<ol style="text-align:left;">';
                  data.results.forEach(item => {
                    html += `<li style="margin-bottom:1em;">`;

                    if (item.url && item.url !== '#') {
                      html += `<a href="${item.url}" target="_blank" rel="noopener" style="font-weight:bold;">${item.title}</a>`;
                    } else {
                      html += `<span style="font-weight:bold; color:#888;">${item.title}</span>`;
                    }

                    if (item.description) {
                      html += `<br/><small>${item.description}</small>`;
                    }
                    html += `</li>`;
                  });
                  html += '</ol>';
                  Swal.fire({
                    title: 'Results',
                    html: html,
                    width: 800,
                    showCloseButton: true,
                    showConfirmButton: false,
                  });
                });
            }
          });
        });
      });
    }
  };
})(jQuery, Drupal);
