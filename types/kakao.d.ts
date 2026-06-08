export {};

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: Record<string, unknown>) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        LatLngBounds: new () => KakaoLatLngBounds;
        Marker: new (options: Record<string, unknown>) => KakaoMarker;
        MarkerImage: new (
          src: string,
          size: KakaoSize,
          options?: Record<string, unknown>,
        ) => KakaoMarkerImage;
        Size: new (width: number, height: number) => KakaoSize;
        Point: new (x: number, y: number) => KakaoPoint;
        ZoomControl: new () => KakaoZoomControl;
        ControlPosition: {
          RIGHT: string;
        };
        event: {
          addListener: (target: KakaoMarker, eventName: string, handler: () => void) => void;
        };
        services: {
          Geocoder: new () => KakaoGeocoder;
          Places: new () => KakaoPlaces;
          Status: {
            OK: string;
          };
          AnalyzeType: {
            EXACT: string;
            SIMILAR: string;
          };
        };
      };
    };
  }

  interface KakaoMap {
    setBounds(bounds: KakaoLatLngBounds): void;
    setCenter(latlng: KakaoLatLng): void;
    panTo(latlng: KakaoLatLng): void;
    addControl(control: KakaoZoomControl, position: string): void;
    getLevel(): number;
    setLevel(level: number): void;
    relayout(): void;
  }

  interface KakaoLatLng {
    getLat(): number;
    getLng(): number;
  }

  interface KakaoLatLngBounds {
    extend(latlng: KakaoLatLng): void;
    isEmpty(): boolean;
  }

  interface KakaoMarker {
    setMap(map: KakaoMap | null): void;
    setImage(image: KakaoMarkerImage): void;
    setZIndex(level: number): void;
  }

  interface KakaoMarkerImage {}

  interface KakaoSize {}

  interface KakaoPoint {}

  interface KakaoZoomControl {}

  interface KakaoGeocoder {
    addressSearch(
      address: string,
      callback: (result: Array<{ x: string; y: string }>, status: string) => void,
      options?: { analyze_type?: string },
    ): void;
  }

  interface KakaoPlaces {
    keywordSearch(
      keyword: string,
      callback: (
        result: Array<{ x: string; y: string }>,
        status: string,
      ) => void,
      options?: { location?: KakaoLatLng },
    ): void;
  }
}
