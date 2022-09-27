// https://styled-components.com/docs/api#create-a-declarations-file

// import original module declarations
import 'styled-components';

// and extend them by declaration merging!
declare module 'styled-components' {
  export interface DefaultTheme {

    colors: {

      appBg: string;
      cardBg: string;
  
      titleBg: string;
      titleFg: string;
  
      fg: string;
      mutedFg: string;
  
      inputBg: string;
      inputBgDown: string;
      inputFg: string;
      inputPlaceholder: string;
      inputDisabledBg: string;
      inputDisabledFg: string;
  
      primaryButtonBg: string;
      primaryButtonBgDown: string;
      primaryButtonFg: string;
  
      messageBg: string;
      messageFg: string;
      sentMessageBg: string;
      sentMessageFg: string;

      error: string;

    };
  }
}

