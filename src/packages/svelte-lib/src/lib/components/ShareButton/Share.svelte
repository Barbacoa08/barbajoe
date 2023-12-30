<script lang="ts">
  import { copyTextToClipboard } from "$lib/utils";

  import { Button } from "../form-elements";

  /* web share API title */
  export let title: string;
  /* web share API text */
  export let text: string;

  export let url: string;
  export let callback:
    | undefined
    | (({ webshared }: { webshared: boolean }) => void) = undefined;

  $: webShareAPISupported =
    typeof window !== "undefined" &&
    typeof navigator.share !== "undefined" &&
    typeof navigator.canShare !== "undefined";

  $: handleWebShare = async () => {
    if (webShareAPISupported) {
      await navigator.share({
        title,
        text,
        url,
      });
      callback?.({ webshared: true });
    } else {
      copyTextToClipboard(url);
      callback?.({ webshared: false });
    }
  };
</script>

<Button variant="secondary" on:click={handleWebShare}><slot /></Button>
