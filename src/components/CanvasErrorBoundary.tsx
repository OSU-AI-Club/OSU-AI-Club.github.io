// Named imports rather than `import React from 'react'`: this project's tsconfig
// has no `esModuleInterop`, under which the default import does not carry the
// class generics, so `this.props` / `this.state` fail to typecheck on a subclass.
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Isolates the WebGL hero.
 *
 * The neural-network canvas is decorative, but it touches three.js, GPU context
 * creation, and GSAP — any of which can throw on unsupported hardware, a lost
 * context, or a driver quirk. Without a boundary an exception there propagates
 * to the root and React unmounts the entire tree, rendering the whole site as a
 * blank page. This degrades to "no background animation" instead.
 *
 * The error is still logged, so real bugs stay visible in devtools rather than
 * being silently swallowed.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  // `@types/react` is not installed, so TS infers React from its JS source and
  // the inherited `props` member is invisible to the compiler. `declare` states
  // the type without emitting a field that would shadow React's own.
  declare props: Props;

  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('NeuralNetworkCanvas failed; hero background disabled.', error, info);
  }

  render() {
    if (this.state.failed) {
      // Keeps the hero's layout height without the animation.
      return <div aria-hidden className="w-full h-full min-h-[420px] md:min-h-[550px]" />;
    }
    return this.props.children;
  }
}
