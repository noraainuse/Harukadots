#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Error handling
set -e

# Function to check if script is run as root
check_root() {
    if [ "$EUID" -eq 0 ]; then 
        echo -e "${RED}Please do not run as root${NC}"
        exit 1
    fi
}

# Function to print status messages
print_status() {
    echo -e "${BLUE}[*] $1${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}[+] $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}[!] $1${NC}"
}

# Function to handle errors
handle_error() {
    print_error "An error occurred during installation"
    print_error "Error on line $1"
    exit 1
}

# Set up error handling
trap 'handle_error $LINENO' ERR

# Function to install yay
install_yay() {
    print_status "Installing yay..."
    if ! command -v yay &> /dev/null; then
        sudo pacman -S --needed --noconfirm base-devel git
        git clone https://aur.archlinux.org/yay.git
        cd yay
        makepkg -si --noconfirm
        cd ..
        rm -rf yay
        print_success "yay installed successfully"
    else
        print_status "yay is already installed"
    fi
}

# Function to select and install GPU drivers
install_gpu_drivers() {
    clear
    echo -e "${YELLOW}GPU Driver Selection${NC}"
    echo "Please select your GPU driver:"
    echo "1) Mesa (Open source - AMD/Intel)"
    echo "2) Mesa-amber (Experimental Mesa)"
    echo "3) NVIDIA Utils"
    
    while true; do
        read -p "Enter your choice (1-3): " gpu_choice
        case $gpu_choice in
            1)
                print_status "Installing Mesa drivers..."
                yay -S --noconfirm mesa
                break
                ;;
            2)
                print_status "Installing Mesa-amber drivers..."
                yay -S --noconfirm mesa-amber
                break
                ;;
            3)
                print_status "Installing NVIDIA utilities..."
                yay -S --noconfirm nvidia-utils nvidia-settings
                break
                ;;
            *)
                print_error "Invalid choice. Please select 1, 2, or 3"
                ;;
        esac
    done
}

# Function to install GRUB theme
install_grub_theme() {
    print_status "Installing Arknights Endfield GRUB theme..."
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    # Clone and install theme files
    git clone https://github.com/Shelton786/Grub-Themes-Arknights_Endfield_Demo.git
    cd Grub-Themes-Arknights_Endfield_Demo/Arknights_Endfield_Demo
    sudo mkdir -p /boot/grub/themes/Arknights_Endfield_Demo
    sudo cp -r * /boot/grub/themes/Arknights_Endfield_Demo/
    
    # Backup original grub config
    sudo cp /etc/default/grub /etc/default/grub.backup
    
    # Update GRUB configuration
    if grep -q '^GRUB_THEME=' /etc/default/grub; then
        # Replace existing GRUB_THEME line
        sudo sed -i 's|^GRUB_THEME=.*|GRUB_THEME="/boot/grub/themes/Arknights_Endfield_Demo/theme.txt"|' /etc/default/grub
    else
        # Add GRUB_THEME line if it doesn't exist
        echo 'GRUB_THEME="/boot/grub/themes/Arknights_Endfield_Demo/theme.txt"' | sudo tee -a /etc/default/grub
    fi
    
    # Update GRUB
    sudo grub-mkconfig -o /boot/grub/grub.cfg
    
    # Cleanup
    cd
    rm -rf "$temp_dir"
    print_success "GRUB theme installed successfully"
}

# Function to install Hyprland and dependencies
install_hyprland() {
    print_status "Installing Hyprland and dependencies..."
    yay -S --noconfirm hyprland-meta-git
    
    print_status "Installing additional packages..."
    packages=(
        waybar
        rofi
        dunst
        kitty
        swaybg
        swaylock-fancy-git
        swayidle
        pamixer
        light
        brillo
    )
    
    yay -S --noconfirm "${packages[@]}"
    print_success "Hyprland and dependencies installed successfully"
}

# Function to install additional software
install_additional_software() {
    print_status "Installing additional software..."
    packages=(
        neovim
        vscodium
        ttf-jetbrains-mono-nerd
        ttf-iosevka
        ttf-iosevka-nerd
        ttf-font-awesome
    )
    
    yay -S --noconfirm "${packages[@]}"
    fc-cache -fv
    print_success "Additional software installed successfully"
}

# Function to install dotfiles
install_dotfiles() {
    print_status "Installing Harukadots..."
    if [ -d ~/.config ]; then
        print_status "Backing up existing .config directory..."
        mv ~/.config ~/.config.bak.$(date +%Y%m%d-%H%M%S)
    fi
    
    mkdir -p ~/.config
    git clone https://github.com/noraainuse/Harukadots.git
    cd Harukadots
    cp -r .config/* ~/.config/
    cd ..
    rm -rf Harukadots
    print_success "Harukadots installed successfully"
}

# Function to setup SDDM
setup_sddm() {
    print_status "Setting up SDDM..."
    yay -S --noconfirm sddm
    sudo systemctl enable sddm.service
    print_success "SDDM setup completed"
}

# Main installation function
main() {
    clear
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════╗"
    echo "║        Harukadots Installer          ║"
    echo "╚═══════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_root
    
    print_status "Starting Harukadots installation..."
    
    install_yay
    install_gpu_drivers
    install_grub_theme
    install_hyprland
    install_additional_software
    install_dotfiles
    setup_sddm
    
    print_success "Installation completed successfully!"
    print_success "System will reboot in 10 seconds..."
    sleep 10
    sudo reboot
}

# Run main function
main
