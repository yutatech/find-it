import os

dp_train = r'/mnt/c/Users/shingo/YOLO/phone/test/labels' # trainフォルダのパスを指定
dp_valid = r'/mnt/c/Users/shingo/YOLO/phone/valid/labels' # validフォルダのパスを指定

TrainFiles = [f for f in os.listdir(dp_train)]
ValidFiles = [f for f in os.listdir(dp_valid)]

for f in TrainFiles:
    with open(os.path.join(dp_train, f), 'r') as tf:
        lines = tf.readlines()

    with open(os.path.join(dp_train, f), 'w') as tf:
        for l in lines:
            parts = l.split()
            if parts:
                parts[0] = '3'
            tf.write(' '.join(parts) + '\n')

for f in ValidFiles:
    with open(os.path.join(dp_valid, f), 'r') as vf:
        lines = vf.readlines()

    with open(os.path.join(dp_valid, f), 'w') as vf:
        for l in lines:
            parts = l.split()
            if parts:
                parts[0] = '3'
            vf.write(' '.join(parts) + '\n')
