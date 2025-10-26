<script>
  let {
    variant = 'primary',
    disabled = false,
    onclick,
    children
  } = $props();

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-gray-300 text-gray-700 hover:bg-gray-400',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
</script>

<button
  class={`px-4 py-2 rounded-lg font-medium transition-colors ${variants[variant]} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
  {disabled}
  {onclick}
>
  {@render children()}
</button>
