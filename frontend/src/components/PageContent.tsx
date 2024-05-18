import React, { ReactNode } from 'react';
import classes from './PageContent.module.css';

interface PageContentProps {
  title: string;
  children: ReactNode;
}

const PageContent: React.FC<PageContentProps> = ({ title, children }) => {
  return (
    <div className={classes.content}>
      <h1>{title}</h1>
      <br />
      {children}
    </div>
  );
};

export default PageContent;
