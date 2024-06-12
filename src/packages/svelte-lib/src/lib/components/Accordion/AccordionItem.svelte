<script lang="ts">
import { genId } from "$lib/utils";

const id = genId();

export let expanded = false;
</script>

<li class={$$props.class}>
  <button
    {id}
    type="button"
    on:click={() => (expanded = !expanded)}
    aria-controls={id}
    aria-expanded={expanded}
  >
    <slot name="header">Header</slot>
  </button>

  <i aria-hidden="true" />

  <section aria-hidden={!expanded} aria-labelledby={id}>
    <slot />
  </section>
</li>

<style>
  /* top level animation+transition */
  li > button ~ i:before,
  li > button ~ i:after,
  li > button ~ section {
    transition: all 0.25s ease-in-out;
  }
  li {
    animation: flipdown 0.3s ease both;
  }

  /* styles for "closed" accordion items */
  li {
    position: relative;
    padding: 1rem 0;
    border-bottom: 1px dotted var(--border-color-gray);
  }

  li > button {
    font-size: larger;
    font-weight: bolder;
    cursor: pointer;
    width: 100%;

    /* removing button styling */
    border: none;
    padding: 0;
    text-align: left;
    background: var(--color-bg);
    color: var(--color-text);
  }

  li > button ~ section {
    position: relative;
    overflow: hidden;
    max-height: 800px;
    transform: translate(0, 0);
  }

  li > button ~ i {
    position: absolute;
    transform: translate(-6px, 0);
    margin-top: 0.5rem;
    right: 0;
  }
  li > button ~ i:before,
  li > button ~ i:after {
    content: "";
    position: absolute;
    background-color: #ff6873;
    width: 3px;
    height: 9px;
  }

  /* styles for opening/opened accordion items */
  li > button ~ i:before {
    transform: translate(-2px, 0) rotate(45deg);
  }
  li > button ~ i:after {
    transform: translate(2px, 0) rotate(-45deg);
  }
  li > button[aria-expanded="false"] ~ section {
    max-height: 0;
    visibility: hidden;
    transform: translate(0, 50%);
  }
  li > button[aria-expanded="false"] ~ i:before {
    transform: translate(2px, 0) rotate(45deg);
  }
  li > button[aria-expanded="false"] ~ i:after {
    transform: translate(-2px, 0) rotate(-45deg);
  }

  @keyframes flipdown {
    0% {
      opacity: 0;
      transform-origin: top center;
      transform: rotateX(-90deg);
    }
    5% {
      opacity: 1;
    }
    80% {
      transform: rotateX(8deg);
    }
    83% {
      transform: rotateX(6deg);
    }
    92% {
      transform: rotateX(-3deg);
    }
    100% {
      transform-origin: top center;
      transform: rotateX(0deg);
    }
  }
</style>
