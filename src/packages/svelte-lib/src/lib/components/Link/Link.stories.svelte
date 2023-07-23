<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Link from "./Link.svelte";
</script>

<Meta title="Components/Link" component={Link} />

<Template let:args>
  <Link {...args}/>
</Template>

<Story name="Auto args" args={{href: "/"}}/>

<!-- Primary -->
<Story name="Link">
  <Link href="https://kagi.com">Kagi Search Engine</Link>
</Story>
