---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---

[About](/about/)

# Posts

{% for post in site.posts %}

<div class="post-meta">{{ post.date | date: "%a, %Y-%m-%d" }}</div>

{:.post-link}
hi [{{ post.title }}]({{ post.url }})

{% endfor %}