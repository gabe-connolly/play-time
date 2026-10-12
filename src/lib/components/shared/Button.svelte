<script>
  let {
    variant = 'primary',
    type = 'button',
    disabled = false,
    onclick,
    children
  } = $props();

  const variants = {
    primary: 'bg-blue-800 text-white hover:bg-blue-900 disabled:bg-blue-300',
    secondary: 'bg-gray-300 text-gray-900 hover:bg-gray-200',
    success: 'bg-green-800 text-white hover:bg-green-900',
    danger: 'bg-red-800 text-white hover:bg-red-900'
  };
</script>

<button
  {type}
  class={`px-4 py-2 rounded-lg font-medium transition-colors ${variants[variant]} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
  {disabled}
  {onclick}
>
  {@render children()}
</button>
