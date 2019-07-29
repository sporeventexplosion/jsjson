# Runs tests in https://github.com/nst/JSONTestSuite (MIT license)

if [ ! -d '__filetests' ]; then
  git clone --depth 1 https://github.com/nst/JSONTestSuite __filetests
fi

if [ $? ]; then
  yarn run filetests
else
  echo "Could not clone tests repository"
fi
