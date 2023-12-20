<ul class="homepage-links">
  <slot />
</ul>

<style>
  :root {
    --list-background-color: rgb(34, 34, 34);
    --list-link-color: white;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --list-background-color: rgb(210, 210, 210);
      --list-link-color: rgb(34, 34, 34);
    }
  }

  ul.homepage-links {
    list-style: none;
    margin-top: 2rem;
    padding: 0;

    display: flex;
    flex-direction: column;
  }
</style>
