#!/usr/bin/env bash

case "$1" in
  tanvir)
    git config --local user.name "Tanvir Mahmud Hossain"
    git config --local user.email "tnvrmh41@gmail.com"
    ;;
  rezwan)
    git config --local user.name "Rezwan Azam"
    git config --local user.email "rezwan.azam06@yahoo.com"
    ;;
  ishmam)
    git config --local user.name "Ishmam Tahmid"
    git config --local user.email "tahmid12955@gmail.com"
    ;;
  adnan)
    git config --local user.name "Mirza Adnan"
    git config --local user.email "mirza.adnan2205@gmail.com"
    ;;
  ariyan)
    git config --local user.name "Mubtasim Sajid Arian"
    git config --local user.email "mubtasimsajidahmedarian.11@gmail.com"
    ;;
  mahmudul)
    git config --local user.name "Mahmudul Hasan"
    git config --local user.email "mahmudulsakib3159@gmail.com"
    ;;
  *)
    echo "Usage: $0 {tanvir|rezwan|ishmam|adnan}"
    exit 1
    ;;
esac

echo "Switched git identity to:"
git config --local user.name
git config --local user.email
