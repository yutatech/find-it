# YOLO

## 学習に使用したデータセット
### watch
- https://universe.roboflow.com/skworld/watches2/dataset/3
- https://universe.roboflow.com/cv-giqay/watches-4qvzt/dataset/1
- https://universe.roboflow.com/yolo-sqan5/object-detection-ptz5b/dataset/2
- https://universe.roboflow.com/wristwatchv3/wrist-watch-vtqer/dataset/3

### glasses
- https://universe.roboflow.com/yvonne-2l2wd/glasses-detection-1k2dp-7jdk4-udumq/dataset/2
- https://universe.roboflow.com/izzat-lukman/glasses-detection-lgvhf/dataset/1
- https://universe.roboflow.com/img4301500/img4302_500/dataset/1
- https://universe.roboflow.com/data-test-ugumg/glasses-object/dataset/2

### remote
- https://universe.roboflow.com/ia-af/merge-gom1y/dataset/1
- https://universe.roboflow.com/yolo-fpsxs/yolo-pfyzc/dataset/1
- https://universe.roboflow.com/project-iec8e/remotes-gfmby/dataset/1

### phone
- https://universe.roboflow.com/schoolproject-p447v/mobilephones-ajdcy/dataset/1


## スクリプトについて
- `edit_textfiles.py`
  - データセットのラベルのクラスを書き換えるためのスクリプト
  - 書き換えたいフォルダのパスと定義したいクラス番号を変更して使用してください
  - 実行コマンド　`python3 edit_textfiles.py`

- `train.py`
  - モデル訓練のためのスクリプト
  - 基にするモデルのパス、学習時のパラメータ、モデルの保存先のパスを変更して使用してください
  - 実行コマンド　`python3 train.py`