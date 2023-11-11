<h1 align="center">IPhisher</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.1.0-green?style=for-the-badge">
  <img src="https://img.shields.io/github/stars/gamerboytr/IPhisher?style=for-the-badge&color=orange">
  <img src="https://img.shields.io/github/forks/gamerboytr/IPhisher?color=cyan&style=for-the-badge&color=purple">
  <img src="https://img.shields.io/github/issues/gamerboytr/IPhisher?color=red&style=for-the-badge">
  <img src="https://img.shields.io/github/license/gamerboytr/IPhisher?style=for-the-badge&color=blue">
  <img src="https://hits.dwyl.com/gamerboytr/IPhisher.svg" width="140" height="28">
<br>
<br>
  <img src="https://img.shields.io/badge/Author-XielQ-purple?style=flat-square">
  <img src="https://img.shields.io/badge/Open%20Source-Yes-green?style=flat-square">
  <img src="https://img.shields.io/badge/Written%20In-JavaScript-yellow?style=flat-square">
</p>

### [•] Description

***A phishing tool that uses images or files to phish people***

### [•] Installation

#### Install dependencies (git, nodejs and openssh)

- For Debian
  - ```sudo apt install git nodejs openssh-client -y```
- For Arch
  - ```sudo pacman -S git nodejs openssh --noconfirm```
- For Fedora
  - ```sudo yum install git nodejs openssh -y```
- For Termux
  - ```pkg install git nodejs openssh -y```

<small>**Pro tip: install wget if not installed**</small>

<small>If you are a windows user, use this links: [git](https://git-scm.com/download/win), [nodejs](https://nodejs.org/en/download/) [openssh](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse)</small>

##### Clone this repository

- ```git clone https://github.com/gamerboytr/IPhisher```

##### Enter the directory

- ```cd IPhisher```

##### Run the tool

- ```npm start```

##### Or use another another package manager

- ```yarn start```
- ```pnpm start```

#### Or directly run

```sh

wget -qP IPhisher https://raw.githubusercontent.com/gamerboytr/IPhisher/master/index.js && (cd IPhisher && node .)

# Or

curl --create-dirs --output-dir IPhisher -O https://raw.githubusercontent.com/gamerboytr/IPhisher/master/index.js && (cd IPhisher && node .)

```

#### Quick Note

If you want to serve your own files, create a directory named `exposed` and put your files into the `exposed` directory and run the tool. It will automatically detect the files and serve them.

```sh

IPhisher
├───exposed
│   ├───index.html
│   └───tools
│       └───ip.txt
├───index.js
├───package.json
└───README.md

```

```sh
<domain>/index.html
<domain>/tools/ip.txt
```

#### CLI Options

```sh
Usage: node index.js [-h] [-p PORT] [--path PATH]

Options:
      --version  Show version number  [boolean]
  -p, --port     Port to run on  [number]
      --path     Fake image path on server  [string]
  -h, --help     Show help  [boolean]
```

### [•] Support

OS         | Support Level
-----------|--------------
Linux      | Excellent
Android    | Excellent
MacOS      | Never tested
WSL        | Excellent
Windows    | Excellent

<small>**Pro tip:** if you want to use cloudflared on termux, open your hotspot before running the tool</small>

### [•] Features

- Cross platform (Support mostly linux)
- Dual Tunneling (Cloudflared, Localhostrun and Serveo)
- Easy to use
- Possible error diagnoser
- Portable file (Can be run from any directory)
- Get IP Address and many other details
- Serve any file (html, txt, js, etc.)

![IPhisher Preview](https://i.imgur.com/xVfACYA.gif)

### [•] Requirements

- `NodeJS (>=12)`
- `SSH`
- `Wget or cURL`

<small>**Info:** If not found, all of the required packages will be installed on first run</small>

### [•] Tested on

- `Windows`
- `WSL`
- `Ubuntu`
- `Kali-Linux`
- `Termux`

### [•] Disclaimer

***This tool is developed for educational purposes. Here it demonstrates how phishing works. If anybody wants to gain unauthorized access to someones social media, he/she may try out this at his/her own risk. You have your own responsibilities and you are liable to any damage or violation of laws by this tool. The author is not responsible for any misuse of IPhisher!***

### [•] License

***This project is licensed under MIT License. See the [LICENSE](LICENSE) file for more details.***

### [•] Credits

- [XielQ](https://github.com/gamerboytr) (Author)
