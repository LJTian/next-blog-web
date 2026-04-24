# Physics Book Homepage Design

## Goal

Build a minimal, premium homepage for `next-blog-web` where scattered content cards first gather into a book, then transition into an interactive 3D book that feels like turning real pages.

The site should feel quiet and tactile, not game-like. Motion should suggest paper, weight, stacking, shadow, and inertia.

## Experience

The first viewport opens on a restrained spatial scene with floating paper cards. Each card represents a blog surface such as featured posts, technical categories, about, and archive. The cards drift subtly and respond to the pointer with light parallax and soft collision-style avoidance.

The primary interaction starts the transformation. Cards move toward the center, align, compress into a stacked block, and resolve into a closed book. The book then opens into the reading state.

In book mode, users can flip pages with click or drag gestures near the page edges. Pages rotate with eased inertia and a slight spring-back at the end of the motion. The book exposes four core spreads:

- Cover: `LJTian` / `Next Blog`
- Featured: highlighted article entries
- Topics: technical categories
- About: short personal intro
- Archive: entry point for all posts

## Visual Direction

The design is minimal and high-end. It should use a calm neutral background, precise typography, restrained shadows, and subtle material contrast between cards, page surfaces, cover, and background.

Avoid colorful arcade motion, decorative blobs, oversized marketing sections, and explanatory UI copy. The first screen should be the actual interactive experience.

## Architecture

Use a new Next.js app in the repository root. The first implementation should favor a client-side interactive homepage with simple local data.

Main units:

- `HomePage`: page shell and high-level scene state.
- `CardField`: initial floating cards and pointer response.
- `BookAssembly`: transition controller that gathers cards into book geometry.
- `BookScene`: 3D book presentation and page flipping.
- `BookPage`: reusable page surface for cover, featured posts, topics, about, and archive.
- `content`: local structured data for homepage cards and book pages.

The scene states are:

- `cards`: cards are floating in the initial layout.
- `assembling`: cards converge and align into a stack.
- `book`: the interactive book is active.

## Technology

Use React, Next.js, TypeScript, and CSS modules or global CSS following the generated app structure. Use Three.js through React Three Fiber for the 3D book scene. Use a lightweight animation approach for the card gather and page flip behavior, preferring deterministic spring/easing logic over a heavy physics engine unless the implementation needs full rigid-body simulation.

The first version can simulate physics through spring motion, inertia, parallax, and collision-like spacing. Real rigid-body physics is not required for the initial homepage because the target feel is tactile paper, not a sandbox.

## Interaction Details

Cards should react to pointer movement without blocking keyboard access. The primary action should be available as a clear button and also by clicking the central scene.

Book pages should flip forward and backward. Page edges should show affordance through cursor change, hover highlight, or small page lift. On small screens, controls can be simplified to previous and next buttons while preserving the visual book motion.

Respect reduced-motion preferences by shortening transitions and disabling continuous drift.

## Error Handling

If WebGL is unavailable or the 3D canvas fails to initialize, show a static high-quality book layout with the same content and navigation. The homepage must remain usable.

## Testing

Verify:

- The project installs and builds.
- The homepage renders without layout overlap on desktop and mobile.
- The initial card scene is visible and interactive.
- The assembly transition reaches book mode reliably.
- Page flipping works forward and backward.
- Reduced-motion users receive a calmer version.
- The WebGL fallback keeps the content accessible.
