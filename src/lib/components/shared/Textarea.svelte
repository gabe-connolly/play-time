<script>
  let {
    placeholder = '',
    value = $bindable(''),
    disabled = false,
    rows = 3
  } = $props();
</script>

<textarea
  {placeholder}
  {disabled}
  {rows}
  bind:value
  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed w-full resize-none"
></textarea>
