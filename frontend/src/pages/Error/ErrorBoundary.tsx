import React, { Component, ReactNode, ErrorInfo } from 'react';
import PageContent from '../../components/PageContent'
import classes from '../../components/PageContent.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  handleRedirect = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <>
          <PageContent title={"Something went wrong"}>
            <p className='errror'>{this.state.error?.message}</p>
            <button className={classes.button} onClick={this.handleRedirect}>Back to start</button>
          </PageContent>
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

