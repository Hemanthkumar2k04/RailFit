declare module 'react-native-qrcode-svg' {
  import * as React from 'react';
  import { ViewStyle } from 'react-native';

  export interface QRCodeProps {
    value: string | number;
    size?: number;
    color?: string;
    backgroundColor?: string;
    getRef?: (c: any) => void;
    logo?: any;
    logoSize?: number;
    logoBackgroundColor?: string;
    logoMargin?: number;
    logoBorderRadius?: number;
    ecl?: 'L' | 'M' | 'Q' | 'H';
    enableLinearGradient?: boolean;
    linearGradient?: [string, string];
    enableLogo?: boolean;
    quietZone?: number;
    onError?: (e: any) => void;
    style?: ViewStyle;
  }

  export default class QRCode extends React.Component<QRCodeProps> {}
}
