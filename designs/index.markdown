---
title: Designs
layout: default
---

Here are my design documents.

<ul>
  {% for design in site.designs %}
    <li>
      <a href="{{ design.url | relative_url }}">{{ design.title }}</a>
    </li>
  {% endfor %}
</ul>
