<!-- 
when templates are used more than once per page
they should have their css and js split into their own files
each will be included only once per page
-->
<div class="card">
  <a href="{{ url }}">
    <div class="card-title">{{ title }}</div>
    <div class="card-img">
      <img src="{{ image }}" alt="{{ title }} image">
    </div>
  </a>
  <div class="card-body">
    {{ body }}
  </div>
  <div class="card-footer">
    {{ footer =  }}
  </div>
</div>
