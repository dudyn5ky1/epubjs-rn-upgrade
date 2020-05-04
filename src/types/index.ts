export type Flow = 'paginated' | 'scrolled';

export type WebviewMessages =
  | {
      method: 'log';
      value: any[];
    }
  | {
      method: 'error';
      value: any[];
    }
  | {
      method: 'longpress';
      position: { x: number; y: number };
      cfi: string;
    }
  | {
      method: 'dblpress';
      position: { x: number; y: number };
      cfi: string;
      imgSrc: string;
    }
  | {
      method: 'press';
      position: { x: number; y: number };
      cfi: string;
    }
  | { method: 'relocated'; location: any }
  | { method: 'selected'; cfiRange: any }
  | { method: 'markClicked'; cfiRange: any; data: any }
  | { method: 'rendered'; sectionIndex: number } // CHECK
  | { method: 'added'; sectionIndex: number } // CHECK
  | { method: 'removed'; sectionIndex: number } // CHECK
  | { method: 'resized'; size: { height: number; width: number } }
  | { method: 'ready' }
  | { method: 'loaded'; value: boolean };
