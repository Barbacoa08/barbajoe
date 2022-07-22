<script lang="ts">
  let count: number = 0;
  const increment = () => {
    count += 1;
  };
</script>

<button class="fancy-btn" on:click={increment}>
  count is {count}
</button>

<style module>
  .fancy-btn {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    cursor: pointer;
    transition: border-color 0.25s;
  }
  .fancy-btn:hover {
    border-color: #646cff;
  }
  .fancy-btn:focus,
  .fancy-btn:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }
</style>
