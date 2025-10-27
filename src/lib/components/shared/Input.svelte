<script>
  let {
    type = 'text',
    placeholder = '',
    value = $bindable(''),
    disabled = false,
    oninput = undefined
  } = $props();
</script>

<input
  {type}
  {placeholder}
  {disabled}
  {value}
  oninput={oninput}
  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
/>
