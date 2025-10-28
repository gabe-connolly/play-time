# Copilot Instructions for play-time

## Project Overview

This is a SvelteKit application for managing sports teams and player rotations. It uses:
- **SvelteKit** (v2.x) with **Svelte 5** (runes API)
- **Vite** as the build tool
- **Vitest** for testing
- **Tailwind CSS** for styling
- **lucide-svelte** for icons

## Project Structure

```
src/
  lib/
    components/    # Reusable Svelte components
      game/        # Game-related components (FieldView, BenchView, PlayerCard)
      setup/       # Setup components (SportSelector, TeamSizeSelector, etc.)
    config/        # Configuration files (sports definitions)
    models/        # Data models (Player, Team, Sport, Formation)
    stores/        # Svelte stores (gameStore, teamStore)
    utils/         # Utility functions (displayName, idGenerator, storage)
  routes/          # SvelteKit routes
  views/           # View components
  app.css          # Global styles
  app.html         # HTML template
tests/             # Test setup files
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## Code Style and Conventions

### Svelte Components
- Use **Svelte 5 runes API** (`$props()`, `$state()`, `$derived()`, `$effect()`)
- Component props should be destructured from `$props()` at the top of the `<script>` tag
- Use `.svelte.js` extension for store files that use runes
- Import from `$lib/` for internal modules (e.g., `import { Player } from '$lib/models/Player.js'`)

### JavaScript
- Use ES6+ features (classes, arrow functions, destructuring)
- Use JSDoc comments for classes and complex functions
- Follow existing patterns for consistency

### File Organization
- Place tests in `__tests__` folders next to the code they test
- Name test files as `ComponentName.test.js` or `moduleName.test.js`
- Models are classes exported from individual files
- Stores use Svelte's reactive state management

### Naming Conventions
- Components: PascalCase (e.g., `PlayerCard.svelte`)
- Files: camelCase for JS files (e.g., `displayName.js`)
- Classes: PascalCase (e.g., `class Player`)
- Functions: camelCase (e.g., `getDisplayName()`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `DEFAULT_SPORTS`)

## Testing

- Use **Vitest** for unit tests
- Use **@testing-library/svelte** for component tests
- Test files should be in `__tests__` directories alongside the code
- Import test utilities: `import '@testing-library/jest-dom'` (already in setup)

Example test structure:
```javascript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';

describe('ComponentName', () => {
  it('should render correctly', () => {
    // test implementation
  });
});
```

## Important Notes

- **Node version**: Project requires Node.js >= 22.0.0
- **Svelte 5**: Use the runes API, not the legacy reactive syntax
- **Accessibility**: Address a11y warnings (ARIA roles, tabindex) when working with interactive elements
- **Build warnings**: The project has a known warning about missing `.svelte-kit/tsconfig.json` - this is expected in the initial setup

## Common Patterns

### Creating a Player
```javascript
import { Player } from '$lib/models/Player.js';
import { generateId } from '$lib/utils/idGenerator.js';

const player = new Player({
  id: generateId(),
  firstName: 'John',
  lastName: 'Doe',
  jerseyNumber: '10',
  status: 'on_bench'
});
```

### Using Stores
```javascript
import { gameStore } from '$lib/stores/gameStore.svelte.js';

// Access state
const currentPlayers = gameStore.players;

// Update state
gameStore.addPlayer(player);
```

### Component with Props (Svelte 5)
```svelte
<script>
  let { player, onSelect = null, showActions = false } = $props();
  
  // Component logic here
</script>

<div>
  <!-- Template here -->
</div>
```

## When Making Changes

1. **Run tests** before and after changes: `npm test`
2. **Build the project** to check for errors: `npm run build`
3. **Follow existing patterns** - check similar files for reference
4. **Add tests** for new functionality
5. **Keep changes minimal** - modify only what's necessary
6. **Maintain accessibility** - ensure interactive elements have proper ARIA attributes

## Deployment

The project uses `@sveltejs/adapter-static` and outputs to the `dist` directory. The build creates both client and server bundles for static site generation.
