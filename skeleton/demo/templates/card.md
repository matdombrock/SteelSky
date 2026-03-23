<!-- 
When templates are used more than once per page
they should have their CSS and JS split into their own files
Each will be included only once per page
-->
<div class="card">
  <a href="{{ url }}">
    <div class="card-title">{{ title }}</div>
    <div class="card-img">
      <img src="{{ image }}" alt="{{ title }} image">
    </div>
  </a>
  <div class="card-body">
    <markdown>
    {{ body }}
    </markdown>
  </div>
</div>
