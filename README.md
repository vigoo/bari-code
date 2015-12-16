# bari-code
*Visual Studio Code* support for [bari](http://vigoo.github.io/bari/).

## Usage
The extension automatically detects the presence of a *bari suite definition* in the workspace root, and adds the following commands to the editor:

- **bari: Change goal** sets the active *target goal*. Also shown on the status bar.
- **bari: Change target product** sets the active *target product*. Also shown on the status bar.
- **bari: Regenerate solution** generates a sln file which can then opened with *OmniSharp*'s *select project* command (currently this has to be done manually)
- **bari: Build** builds the suite
- **bari: Test** builds and runs the tests in the suite
- **bari: Open suite.yaml** opens the suite definition
- **bari: Update self** updates *bari*

## Configuration

There are two configurable values currently:

- `bari.commandLine` specifies the location of the build tool
- `bari.verboseOutput` enables verbose output (with the `-v` command line option)
