#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
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

# Function to install GRUB theme
install_grub_theme() {
    print_status "Installing Arknights Endfield GRUB theme..."
    
    # Create temporary directory
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    # Clone the repository
    git clone https://github.com/Shelton786/Grub-Themes-Arknights_Endfield_Demo.git
    cd Grub-Themes-Arknights_Endfield_Demo/Arknights_Endfield_Demo
    
    # Create themes directory if it doesn't exist
    sudo mkdir -p /boot/grub/themes/Arknights_Endfield_Demo
    
    # Copy theme files
    sudo cp -r * /boot/grub/themes/Arknights_Endfield_Demo/
    
    # Update GRUB configuration
    if ! grep -q "GRUB_THEME=" /etc/default/grub; then
        echo 'GRUB_THEME="/boot/grub/themes/Arknights_Endfield_Demo/theme.txt"' | sudo tee -a /etc/default/grub
    else
        sudo sed -i 's|^GRUB_THEME=.*|GRUB_THEME="/boot/grub/themes/Arknights_Endfield_Demo/theme.txt"|' /etc/default/grub
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
    yay -S --needed hyprland-meta-git
    
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

    print_status "Updating font cache..."
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
    # Clear the screen
    clear
    
    # Print banner
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════╗"
    echo "║        Harukadots Installer          ║"
    echo "╚═══════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Check if running as root
    check_root
    
    # Confirm installation
    read -p "Do you want to proceed with the installation? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    
    print_status "Starting Harukadots installation..."
    
    install_yay
    install_grub_theme
    install_hyprland
    install_additional_software
    install_dotfiles
    setup_sddm
    
    print_success "Installation completed successfully!"
    print_success "Please reboot your system to start using Harukadots"
    
    read -p "Would you like to reboot now? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo reboot
    fi
}

# Run main function
main
