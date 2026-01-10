import {
    Laptop,
    Monitor,
    Cpu,
    Keyboard,
    Award,
    Printer,
    Globe,
    HardDrive,
    MemoryStick,
    Mouse,
    Headphones,
    Webcam,
    Speaker,
    Tv,
    Smartphone,
    Tablet,
    Watch,
    Gamepad2,
    Router,
    Server,
    BatteryCharging,
    Fan,
    Box,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type CategoryIconMap = Record<string, LucideIcon>;

// Centralized, reusable mapping: category name (lowercase) → Lucide icon
export const categoryIconMap: CategoryIconMap = {
    // Laptops
    laptop: Laptop,
    laptops: Laptop,
    notebook: Laptop,
    notebooks: Laptop,
    "laptops & notebooks": Laptop,
    ultrabook: Laptop,
    ultrabooks: Laptop,

    // Desktops
    desktop: Monitor,
    desktops: Monitor,
    "desktop computers": Monitor,
    "all-in-one": Monitor,
    "all in one": Monitor,
    pc: Monitor,

    // Components
    component: Cpu,
    components: Cpu,
    "pc components": Cpu,
    cpu: Cpu,
    processor: Cpu,
    motherboard: Cpu,
    ram: MemoryStick,
    memory: MemoryStick,
    gpu: Box,
    "graphics card": Box,
    vga: Box,
    "video card": Box,

    // Storage
    storage: HardDrive,
    hdd: HardDrive,
    ssd: HardDrive,
    "solid state drive": HardDrive,
    drive: HardDrive,

    // Monitors & TVs
    monitor: Monitor,
    monitors: Monitor,
    display: Monitor,
    screen: Monitor,
    tv: Tv,

    // Peripherals & Accessories
    accessory: Keyboard,
    accessories: Keyboard,
    peripheral: Keyboard,
    peripherals: Keyboard,
    mouse: Mouse,
    keyboard: Keyboard,
    webcam: Webcam,
    headphone: Headphones,
    headphones: Headphones,
    speaker: Speaker,
    speakers: Speaker,

    // Mobile Devices
    smartphone: Smartphone,
    phone: Smartphone,
    mobile: Smartphone,
    tablet: Tablet,
    tablets: Tablet,
    smartwatch: Watch,
    wearable: Watch,

    // Gaming
    gaming: Gamepad2,
    "gaming gear": Gamepad2,
    game: Gamepad2,
    console: Gamepad2,

    // Printers & Scanners
    printer: Printer,
    printers: Printer,
    scanner: Printer,
    "printers & scanners": Printer,

    // Networking
    network: Router,
    networking: Router,
    router: Router,
    wifi: Globe,
    switch: Globe,

    // Servers & Data
    server: Server,
    nas: Server,

    // Power & Cooling
    psu: BatteryCharging,
    "power supply": BatteryCharging,
    cooling: Fan,
    fan: Fan,

    // Software / Other
    software: Box,
    application: Box,
    app: Box,
};

// Optional: Default fallback icon if no match
export const defaultCategoryIcon = Award;