---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---

[About](/about/) | [Designs](/designs/)

# Posts

{% for post in site.posts %}

<div style="font-size:75%">{{ post.date | date: "%a, %Y-%m-%d" }}</div>

[{{ post.title }}]({{ post.url }})

{% endfor %}