# OpenAI Web Search Assist

**Version:** v1.0.0

**OpenAI Web Search Assist** is a Drupal module that helps editors fetch real-time related article suggestions directly from OpenAI, using the `gpt-4o-search-preview` model with web search enabled. Results are displayed in a clean, scrollable **SweetAlert2 modal**, including the article title, publish date, description, and relevance score.

---

## 📦 Installation

1. Place the module inside your custom module folder:

   ```
   modules/custom/openai_web_search_assist
   ```

2. Enable the module using Drush:

   ```bash
   drush en openai_web_search_assist -y
   ```

3. Clear the Drupal cache:

   ```bash
   drush cr
   ```

4. Ensure the **Key module** is installed and enabled. This is required to securely store the OpenAI API key.

---

## 🔑 Dependencies

This module requires the following:

### Drupal Modules

- [Key module](https://www.drupal.org/project/key): For storing the OpenAI API key securely.

### Drupal Core Libraries

- `core/jquery`
- `core/once`
- `core/drupal`
- `core/drupal.dialog.ajax`

### External JS Library

- [SweetAlert2](https://sweetalert2.github.io/) (included via CDN)

---

## 🔧 Setup OpenAI Key

1. Go to the Key management page:

   ```
   /admin/config/system/keys
   ```

2. Create a new key:

  - **Key name**: `OpenAI Key`
  - **Machine name**: `openai_key`
  - **Key type**: Configuration
  - **Key value**: Your OpenAI API key (e.g. `sk-...`)

3. Save and exit.

> 🔐 Your key will be used to authenticate with the OpenAI Chat Completion API using the `gpt-4o-search-preview` model with `web_search_options` enabled.

---

## ✅ How to Use

1. Navigate to **Content → Add Article** or edit an existing Article.
2. Enter your article title.
3. A button labelled **Search Related News** will appear directly below the title field.
4. Click the button. A SweetAlert2 modal will appear asking for the number of results (e.g., 3, 5, 7, or 10).
5. After confirmation:
  - The module will send a request to OpenAI to search for real-time articles related to the title.
  - The modal will display a scrollable list of articles, each including:
    - 🔗 Clickable title
    - 🗓️ Published date
    - 📄 Description (first paragraph)
    - 🎯 Relevance score (1–10 with star rating)

---

## ✨ Features

| Feature                       | Description                                                                 |
|------------------------------|-----------------------------------------------------------------------------|
| 🔎 Real-time Web Search       | Uses `gpt-4o-search-preview` with `web_search_options: {}`                 |
| 🧠 Smart Prompting            | Forces OpenAI to return valid JSON format with structured article metadata |
| 🔗 Title + URL                | Every result includes a clickable link to the article                      |
| 📅 Publish Date               | Extracted from OpenAI result (when available)                              |
| ⭐ Relevance Score            | Numerical score from 1–10 and visual stars for each article                |
| 🧾 Description (Paragraph)    | Extracts short summary or first paragraph from the article                 |
| 🔧 User-controlled Results    | Editor selects how many results to show before searching                   |
| 🧊 SweetAlert2 UI             | Uses SweetAlert2 for a modern, scrollable popup experience                 |
| 🔐 Secure Key Handling        | Uses Drupal's Key module for API key storage                               |

---

## 📝 Notes

- This module **does not store** results in the node.
- It is meant to **assist editors** in finding relevant articles to enrich their writing.
- Only visible to users with permission to access content.
- Fully frontend-only — no admin config or database tables required.
- You must have OpenAI account access to `gpt-4o-search-preview`.

---

## 🛠 Customization Ideas

Want to go further?

- Insert result as Paragraph or Link field
- Use AI to auto-generate meta description based on selected result
- Add language switch for multilingual search

Dinda can help 😎

---

## 📬 Feedback & Contributions

Pull requests welcome!
Module created with ❤️ by Kanda & Dinda using real-world editorial workflow needs.

---

## 📁 Folder Structure

```
openai_web_search_assist/
├── js/
│   └── swal_search.js
├── src/
│   └── Controller/
│       └── SearchModalController.php
├── css/
│   └── (optional custom modal css)
├── openai_web_search_assist.info.yml
├── openai_web_search_assist.routing.yml
├── openai_web_search_assist.libraries.yml
├── openai_web_search_assist.module
└── README.md
```

---
