# Albumate

Albumate is an intelligent desktop application designed to revolutionize the way you organize and search your photo collection. Using advanced AI vision technology with OpenAI and Ollama support, Albumate automatically analyzes and tags your photos, making it easier than ever to find the exact image you're looking for.

## About

Albumate was created to solve the common problem of managing ever-growing photo libraries. By leveraging the power of AI, it allows users to spend less time organizing and more time enjoying their memories.

Whether you're a professional photographer with thousands of images or just someone with a lot of family photos, Albumate helps you make sense of your visual data quickly and efficiently.

Stay tuned for updates and happy photo organizing!

## Key Features

- Automatic photo description and tagging using AI vision
- Smart search functionality to find photos by content, objects, or scenes
- Local processing option for enhanced privacy
- User-friendly interface for easy navigation of your photo collection
- Support for OpenAI and Ollama models

## Supported model providers

Albumate has been (kinda) tested and supports the following AI models:

**OpenAI:**

- gpt-4o
- gpt-4-turbo

**Ollama:**

- [minicpm-v](https://ollama.com/library/minicpm-v)

It will probably work with other models as well, but these haven't been tested.

## Getting Started

### Prerequisites

- Node.js and npm (or yarn) installed on your system

### Installation (easy)

1. Download the latest release from the [releases page](https://github.com/wladimiiir/albumate/releases).

2. Run the application.

### Installation (not so easy)

1. Clone the repository:

```bash
git clone https://github.com/your-username/albumate.git
```

2. Navigate to the project directory:

```bash
cd albumate
```

3. Install the dependencies:

```bash
npm install
```

4. Build the application:

```bash
npm run build
```

5. Run the application:

```bash
npm run start
```

## Usage

1. Launch the Albumate application.
2. Add a folder containing your photos using the "Add Folder" button.
3. Albumate will automatically analyze and tag your photos.
4. Use the search bar to find photos by content, objects, or scenes.
5. Click on an image to view its details and tags.

## Configuration

You can configure the AI model provider and other settings in the Settings screen.

## Contributing

Contributions are welcome! If you find any bugs or have suggestions for new features, please open an issue and/or PR on the GitHub repository.

## License

This project is licensed under the MIT License.
