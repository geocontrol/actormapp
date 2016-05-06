SRC_ROOT=~
SRC_DIR=$SRC_ROOT/aladmin
if [ -d "$SRC_DIR" ]; then
  cd $SRC_DIR
  git pull origin master
  npm update
else
  mkdir -p $SRC_ROOT
  git clone https://github.com/geekyoto/AlwaysListeningAdmin.git $SRC_DIR
  cd $SRC_DIR
  npm install
fi
