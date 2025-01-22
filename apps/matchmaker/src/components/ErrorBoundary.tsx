import type { ErrorInfo, ReactNode } from "react";
import React, { Component } from "react";
import { sendSlackMessage, SLACK_MANAGER1_ID_MENTION } from "@ieum/slack";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV === "development") {
      console.error(error, errorInfo);

      return;
    }

    sendSlackMessage({
      channel: "에러_알림",
      content: `${SLACK_MANAGER1_ID_MENTION} ErrorBoundary caught an error\n${error}\n${errorInfo.componentStack}\n${errorInfo.digest}`,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <h1>에러가 발생했습니다. 호스트에게 문의해주세요.</h1>;
    }

    return this.props.children;
  }
}
