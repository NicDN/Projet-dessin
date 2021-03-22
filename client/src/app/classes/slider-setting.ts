export interface SliderSetting {
    title: string;
    unit: string;
    min: number;
    max: number;

    getAttribute: () => number;
    action: (value: number) => void;
}
