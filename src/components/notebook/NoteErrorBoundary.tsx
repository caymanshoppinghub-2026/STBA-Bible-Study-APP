import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Edit3 } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackContent?: string;
  onSwitchToDraft?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class NoteErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[NoteErrorBoundary] Caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="flex-1 flex flex-col h-full w-full p-6 md:p-8 overflow-y-auto bg-[var(--nb-bg,#0d0d0d)] text-[var(--nb-text,#eaeaea)]"
          id="note-error-fallback"
        >
          <div className="max-w-2xl mx-auto w-full my-auto flex flex-col items-center text-center p-6 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3 border border-amber-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <h3 className="text-base font-semibold text-[var(--nb-text,#eaeaea)] mb-1">
              Scripture Note Reader Notice
            </h3>
            
            <p className="text-xs text-[var(--nb-text-muted,#9a9490)] max-w-md mb-4 leading-relaxed">
              We encountered an issue displaying formatted study elements for this note. Your draft content is safe and accessible below.
            </p>

            <div className="flex items-center gap-2 mb-6">
              {this.props.onSwitchToDraft && (
                <button
                  type="button"
                  onClick={() => {
                    this.handleReset();
                    this.props.onSwitchToDraft?.();
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--nb-gold,#C5A059)] text-stone-950 hover:opacity-90 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Return to Draft Mode</span>
                </button>
              )}

              <button
                type="button"
                onClick={this.handleReset}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-[var(--nb-border,#333)] text-[var(--nb-text-muted,#9a9490)] hover:text-white hover:border-white/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry View</span>
              </button>
            </div>

            {this.props.fallbackContent && (
              <div className="w-full text-left bg-black/40 border border-white/10 rounded-lg p-4 max-h-60 overflow-y-auto">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--nb-text-dim,#666)] block mb-1">
                  Preserved Note Content:
                </span>
                <pre className="text-xs font-mono whitespace-pre-wrap break-words text-[var(--nb-text-muted,#aaa)]">
                  {this.props.fallbackContent}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
