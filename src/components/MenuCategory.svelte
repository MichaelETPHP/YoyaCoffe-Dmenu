<script>
  import MenuItem from './MenuItem.svelte';
  
  export let category;
</script>

<section class="menu-category">
  <h2 class="text-2xl font-bold text-amber-900 mb-4 pb-2 border-b-2 border-amber-300">{category.name}</h2>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    {#each category.items as item}
      <MenuItem {item} />
    {/each}
  </div>
</section>
