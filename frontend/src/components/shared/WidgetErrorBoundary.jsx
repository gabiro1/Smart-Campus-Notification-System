import { Component } from "react";

export default class WidgetErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error(`Widget [${this.props.name || "unknown"}] failed:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
            <p className="text-sm text-red-400 font-medium">
              {this.props.name || "Widget"} failed to load
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground underline"
            >
              Retry
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
