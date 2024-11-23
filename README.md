<div align="center">
<img alt="Profiles Pictures" src="https://i.pinimg.com/control2/736x/13/f4/27/13f427b46444ae2a2d2ccaff67f20bae.jpg" width="200" height="200"/>
</div>
<div align="center">
    <h3>🔮 noraainuse Dotfiles 🔮</h3>
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&center=true&vCenter=true&width=300&lines=Love+To+Elaina-sann+%3A3"
</div>
</div>

# Contents 📚:
### **☘ Don't copy all setup , Use at your own risk :3**
### Overview 🎑

- [🌳 Windows Manager]:
  - [🍚 HyprLand](https://hyprland.org/)
- [🔳 Terminal]:
  - [Kitty 🐈‍⬛](https://sw.kovidgoyal.net/kitty/)
  - [Alacritty 🗻](https://alacritty.org/)
- [🌌 Shell](#shell): 
    - [Oh My Zsh](https://ohmyz.sh/#install)
    - **Plugin Manager**: [Zap](https://www.zapzsh.org/)
    - **🤖 Prompt**: [Powerlevel10k Prompt (˶˃ ᵕ ˂˶)](https://github.com/romkatv/powerlevel10k)
# Installations 💫:
- This config need first [Hyprland](https://hyprland.org/) using this [guide](https://wiki.hyprland.org/Getting-Started/Installation/) depend on your Distro:

### Arch

```zsh
  yay -S hyprland-git
  ```
### Ubuntu / Debian
```zsh
sudo apt install hyprland
```
### Fedora
```zsh
sudo dnf install hyprland
sudo dnf install hyprland-devel
```
### Base setups (💻):

- Install waybar, Rofi, Dunst, kitty terminal, swaybg, swaylock-fancy, swayidle, pamixer, light, Brillo:

```
yay -S waybar-hyprland rofi dunst kitty swaybg swaylock-fancy-git swayidle pamixer light brillo
```
### Other Distro Dependents on your packages manager
- Example : dnf , apt , xbps

### Necessary Font 🔑:

- [JetBrains Mono Nerd Font](https://github.com/ryanoasis/nerd-fonts/releases/download/v2.2.2/JetBrainsMono.zip)

- [Iosevka Nerd Font](https://github.com/ryanoasis/nerd-fonts/releases/download/v2.3.3/Iosevka.zip)

- [Font Awesome](https://archlinux.org/packages/community/any/ttf-font-awesome/)
  ```
  yay -S ttf-font-awesome
  ```
  Then run this command for your system to detect the newly installed fonts.

```
fc-cache -fv
```
  Once you download them and unpack them, place them into `~/.fonts` or `~/.local/share/fonts.`
### Clone Dotfiles 🌙:
```
git clone https://github.com/noraainuse/dotfiles
cd dotfiles
cp -r ./configs/* ~/.config/
```
  > Finally, now you can login with New Hyprland Rice


Congratulations!!, at this point you successfully have installed Hyprland Your new Rice ✨🌙
