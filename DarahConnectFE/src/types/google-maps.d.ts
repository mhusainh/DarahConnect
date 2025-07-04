declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      addListener(eventName: string, handler: () => void): void;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map?: Map, anchor?: Marker): void;
    }

    class Size {
      constructor(width: number, height: number);
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: string;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon;
    }

    interface InfoWindowOptions {
      content?: string;
    }

    interface Icon {
      url: string;
      scaledSize?: Size;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
  }
}

export {}; 