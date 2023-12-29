<script lang="ts">
  import { browser } from "$app/environment";
  import { copyTextToClipboard } from "$lib/utils";

  import { Button } from "../form-elements";

  /* web share API title */
  export let title: string;
  /* web share API text */
  export let text: string;

  export let url: string;
  export let callback: undefined | (() => void) = undefined;

  $: webShareAPISupported =
    browser &&
    typeof navigator.share !== "undefined" &&
    typeof navigator.canShare !== "undefined";

  $: handleWebShare;
  const handleWebShare = async () => {
    if (webShareAPISupported) {
      navigator.share({
        title,
        text,
        url,
      });
    } else {
      copyTextToClipboard(url);
    }

    callback?.();
  };
</script>

<Button variant="secondary" on:click={handleWebShare}><slot /></Button>
