<script>
import Post from "../Post.svelte";
import Posts from "../Posts.svelte";
</script>

<main>
  <Posts>
    <Post disabled href="/post/1">Disabled Post</Post>
    <Post href="/post/2">Enabled Post</Post>
  </Posts>
</main>
