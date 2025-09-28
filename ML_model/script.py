# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.794Z"},"jupyter":{"outputs_hidden":false}}
import os
import gc
import sys

import pandas as pd
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
import skimage
from skimage.feature import hog, canny
from skimage.filters import sobel
from skimage import color

from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import OneHotEncoder

from keras import layers
import keras.backend as K
from keras.models import Sequential, Model
from keras.preprocessing import image
from keras.layers import Input, Dense, Activation, Dropout
from keras.layers import Flatten, BatchNormalization, Conv2D
from keras.layers import MaxPooling2D, AveragePooling2D, GlobalAveragePooling2D 
from keras.applications.imagenet_utils import preprocess_input
from tensorflow.keras.applications.vgg16 import VGG16
from tensorflow.keras.applications.inception_v3 import InceptionV3
from tensorflow.keras.applications import ResNet50
from tf_explain.core.activations import ExtractActivations
from tf_explain.core.smoothgrad import SmoothGrad

from PIL import Image
from tqdm import tqdm
import random as rnd
import cv2
from keras.preprocessing.image import ImageDataGenerator
from numpy import expand_dims

from livelossplot import PlotLossesKeras



# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# # Loading Dataset
# We'll use here the Pandas to load the dataset into memory

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.794Z"},"jupyter":{"outputs_hidden":false}}
train_path = '../input/railway-track-fault-detection/Railway Track fault Detection Updated/Train'
val_path = '../input/railway-track-fault-detection/Railway Track fault Detection Updated/Validation'
test_path = '../input/railway-track-fault-detection/Railway Track fault Detection Updated/Test'

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# # Analyzing counts

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.794Z"},"jupyter":{"outputs_hidden":false}}
train_df_defective = pd.DataFrame(os.listdir(train_path+'/Defective'))
val_df_defective = pd.DataFrame(os.listdir(val_path+'/Defective')) 
test_df_defective = pd.DataFrame(os.listdir(test_path+'/Defective')) 
train_df_undefective = pd.DataFrame(os.listdir(train_path+'/Non defective'))
val_df_undefective = pd.DataFrame(os.listdir(val_path+'/Non defective')) 
test_df_undefective = pd.DataFrame(os.listdir(test_path+'/Non defective'))

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.794Z"},"jupyter":{"outputs_hidden":false}}
defective=pd.concat([train_df_defective,test_df_defective,val_df_defective], axis=0)
undefective=pd.concat([train_df_undefective,test_df_undefective,val_df_undefective], axis=0)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.795Z"},"jupyter":{"outputs_hidden":false}}
print('Train samples defective: ', len(train_df_defective))
print('Val samples defective: ', len(val_df_defective))
print('Test samples defective: ', len(test_df_defective))
print()
print('Train samples undefective: ', len(train_df_undefective))
print('Val samples undefective: ', len(val_df_undefective))
print('Test samples undefective: ', len(test_df_undefective))

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# # Defective train data

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.795Z"},"jupyter":{"outputs_hidden":false}}
plt.figure(figsize = (15,12))
for idx,image_path in enumerate(train_df_defective[0]):
    if idx==31:
        break
    plt.subplot(4,8,idx+1)
    img = Image.open('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Train/Defective/'+image_path)
    img = img.resize((224,224))
    plt.imshow(img)
    plt.axis('off')
    plt.title(idx)
plt.tight_layout()
plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# # Undefective train data

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.796Z"},"jupyter":{"outputs_hidden":false}}
plt.figure(figsize = (15,12))
for idx,image_path in enumerate(train_df_undefective[0]):
    if idx==31:
        break
    plt.subplot(4,8,idx+1)
    img = Image.open('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Train/Non defective/'+image_path)
    img = img.resize((224,224))
    plt.imshow(img)
    plt.axis('off')
    plt.title(idx)
plt.tight_layout()
plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# # Defective Test Data

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.796Z"},"jupyter":{"outputs_hidden":false}}
plt.figure(figsize = (15,12))
for idx,image_path in enumerate(test_df_defective[0]):
    if idx==31:
        break
    plt.subplot(4,8,idx+1)
    img = Image.open('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Test/Defective/'+image_path)
    img = img.resize((224,224))
    plt.imshow(img)
    plt.axis('off')
    plt.title(idx)
plt.tight_layout()
plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# # Undefective test data

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.797Z"},"jupyter":{"outputs_hidden":false}}
plt.figure(figsize = (15,12))
for idx,image_path in enumerate(test_df_undefective[0]):
    if idx==31:
        break
    plt.subplot(4,8,idx+1)
    img = Image.open('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Test/Non defective/'+image_path)
    img = img.resize((224,224))
    plt.imshow(img)
    plt.axis('off')
    plt.title(idx)
plt.tight_layout()
plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# # Counts of defective and undefective

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.798Z"},"jupyter":{"outputs_hidden":false}}
y=[len(defective),len(undefective)]
x=['defective', 'undefective']
# Create bars
plt.xlabel('Categories')
plt.ylabel('Counts')
plt.bar(x, y)
plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# # Image Resolutions

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.798Z"},"jupyter":{"outputs_hidden":false}}
widths, heights = [], []
defective_path_images = []

for path in tqdm(defective[0]):
    try:
        width, height = Image.open('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Test/Defective/'+path).size
        widths.append(width)
        heights.append(height)
        defective_path_images.append('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Test/Defective/'+path)
    except:
        try:
            width, height = Image.open('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Train/Defective/'+path).size
            widths.append(width)
            heights.append(height)
            defective_path_images.append('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Train/Defective/'+path)
        except:
            try:
                width, height = Image.open('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Validation/Defective/'+path).size
                widths.append(width)
                heights.append(height)
                defective_path_images.append('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Validation/Defective/'+path)
            except:
                continue
    
df_defective = pd.DataFrame()
df_defective["width"] = widths
df_defective["height"] = heights
df_defective["path"] = defective_path_images
df_defective["dimension"] = df_defective["width"] * df_defective["height"]

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.799Z"},"jupyter":{"outputs_hidden":false}}
df_defective.sort_values('width').head(84)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.799Z"},"jupyter":{"outputs_hidden":false}}
df_defective.head(84).mean()

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.800Z"},"jupyter":{"outputs_hidden":false}}
widths, heights = [], []
undefective_path_images = []

for path in tqdm(undefective[0]):
    try:
        width, height = Image.open('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Test/Non defective/'+path).size
        widths.append(width)
        heights.append(height)
        undefective_path_images.append('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Test/Non defective/'+path)
    except:
        try:
            width, height = Image.open('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Train/Non defective/'+path).size
            widths.append(width)
            heights.append(height)
            undefective_path_images.append('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Train/Non defective/'+path)
        except:
            try:
                width, height = Image.open('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Validation/Non defective/'+path).shape
                print(width)
                widths.append(width)
                heights.append(height)
                undefective_path_images.append('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Validation/Non defective/'+path)
            except:
                continue
    
df_undefective = pd.DataFrame()
df_undefective["width"] = widths
df_undefective["height"] = heights
df_undefective["path"] = undefective_path_images
df_undefective["dimension"] = df_undefective["width"] * df_undefective["height"]

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.800Z"},"jupyter":{"outputs_hidden":false}}
df_undefective.sort_values('width').tail(84)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.800Z"},"jupyter":{"outputs_hidden":false}}
df_undefective.head(84).mean()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Ram Issues

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.801Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Analysis
# A 448x448 input model will work quite fine for this approach yet their will be quite a significant amount of loss of information

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# # Color Analysis
# We need to do some color analysis to get an ida about the augmentation technique needed for this problem

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.801Z"},"jupyter":{"outputs_hidden":false}}
def is_grey_scale(givenImage):
    w,h = givenImage.size
    for i in range(w):
        for j in range(h):
            r,g,b = givenImage.getpixel((i,j))
            if r != g != b: return False
    return True

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.802Z"},"jupyter":{"outputs_hidden":false}}
sampleFrac = 0.4
#get our sampled images
isGreyList = []
for imageName in df_undefective["path"].sample(frac=sampleFrac):
    val = Image.open(imageName).convert('RGB')
    isGreyList.append(is_grey_scale(val))
print(np.sum(isGreyList) / len(isGreyList))
del isGreyList

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.802Z"},"jupyter":{"outputs_hidden":false}}
sampleFrac = 0.4
#get our sampled images
isGreyList = []
for imageName in df_defective["path"].sample(frac=sampleFrac):
    val = Image.open(imageName).convert('RGB')
    isGreyList.append(is_grey_scale(val))
print(np.sum(isGreyList) / len(isGreyList))
del isGreyList

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Intensity Analysis

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.802Z"},"jupyter":{"outputs_hidden":false}}
def get_rgb_men(row):
    img = cv2.imread(row['path'])
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    return np.sum(img[:,:,0]), np.sum(img[:,:,1]), np.sum(img[:,:,2])

tqdm.pandas()
df_defective['R'], df_defective['G'], df_defective['B'] = zip(*df_defective.progress_apply(lambda row: get_rgb_men(row), axis=1) )

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.803Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.803Z"},"jupyter":{"outputs_hidden":false}}
def get_rgb_men(row):
    img = cv2.imread(row['path'])
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    return np.sum(img[:,:,0]), np.sum(img[:,:,1]), np.sum(img[:,:,2])

tqdm.pandas()
df_undefective['R'], df_undefective['G'], df_undefective['B'] = zip(*df_undefective.progress_apply(lambda row: get_rgb_men(row), axis=1) )

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.804Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.805Z"},"jupyter":{"outputs_hidden":false}}
def show_color_dist(df, count):
    fig, axr = plt.subplots(count,2,figsize=(15,15))
    if df.empty:
        print("Image internsity of selected color is weak")
        return
    for idx, i in enumerate(np.random.choice(df['path'], count)):
        img = cv2.imread(i)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        axr[idx,0].imshow(img)
        axr[idx,0].axis('off')
        axr[idx,1].set_title('R={:.0f}, G={:.0f}, B={:.0f} '.format(np.mean(img[:,:,0]), np.mean(img[:,:,1]), np.mean(img[:,:,2]))) 
        x, y = np.histogram(img[:,:,0], bins=255)
        axr[idx,1].bar(y[:-1], x, label='R', alpha=0.8, color='red')
        x, y = np.histogram(img[:,:,1], bins=255)
        axr[idx,1].bar(y[:-1], x, label='G', alpha=0.8, color='green')
        x, y = np.histogram(img[:,:,2], bins=255)
        axr[idx,1].bar(y[:-1], x, label='B', alpha=0.8, color='blue')
        axr[idx,1].legend()
        axr[idx,1].axis('off')

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# #### Red

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.806Z"},"jupyter":{"outputs_hidden":false}}
df = df_defective[((df_defective['B']*1.05) < df_defective['R']) & ((df_defective['G']*1.05) < df_defective['R'])]
show_color_dist(df, 8)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.807Z"},"jupyter":{"outputs_hidden":false}}
df = df_undefective[((df_undefective['B']*1.05) < df_undefective['R']) & ((df_undefective['G']*1.05) < df_undefective['R'])]
show_color_dist(df, 8)

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# #### Green

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.808Z"},"jupyter":{"outputs_hidden":false}}
df = df_defective[(df_defective['G'] > df_defective['R']) & (df_defective['G'] > df_defective['B'])]
show_color_dist(df, 8)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.808Z"},"jupyter":{"outputs_hidden":false}}
df = df_undefective[(df_undefective['G'] > df_undefective['R']) & (df_undefective['G'] > df_undefective['B'])]
show_color_dist(df, 8)

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# #### Blue

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.809Z"},"jupyter":{"outputs_hidden":false}}
df = df_defective[(df_defective['B'] > df_defective['R']) & (df_defective['B'] > df_defective['G'])]
show_color_dist(df, 8)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.809Z"},"jupyter":{"outputs_hidden":false}}
df = df_undefective[(df_undefective['B'] > df_undefective['R']) & (df_undefective['B'] > df_undefective['G'])]
show_color_dist(df, 8)

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Ram Issues

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.810Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# # Features

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Analyzing Edges
# A Sobel filter is one means of getting a basic edge magnitude/gradient image. Can be useful to threshold and find prominent linear features, etc. Several other similar filters in skimage.filters are also good edge detectors: roberts, scharr, etc. and you can control direction, i.e. use an anisotropic version.

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Defective

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.810Z"},"jupyter":{"outputs_hidden":false}}
for path in df_defective['path'].head(4):
    image = cv2.imread(path)
    gray=cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = sobel(image)
    gray_edges=canny(gray)
    dimension = edges.shape
    fig = plt.figure(figsize=(8, 8))
    plt.suptitle("Defective")
    plt.subplot(2,2,1)
    plt.imshow(gray_edges)
    plt.subplot(2,2,2)
    plt.imshow(edges[:dimension[0],:dimension[1],0], cmap="gray")
    plt.subplot(2,2,3)
    plt.imshow(edges[:dimension[0],:dimension[1],1], cmap='gray')
    plt.subplot(2,2,4)
    plt.imshow(edges[:dimension[0],:dimension[1],2], cmap='gray')
plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Undefective

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.810Z"},"jupyter":{"outputs_hidden":false}}
for path in df_undefective['path'].head(4):
    image = cv2.imread(path)
    gray=cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = sobel(image)
    gray_edges=canny(gray)
    dimension = edges.shape
    fig = plt.figure(figsize=(8, 8))
    plt.suptitle("Non Defective")
    plt.subplot(2,2,1)
    plt.imshow(gray_edges)
    plt.subplot(2,2,2)
    plt.imshow(edges[:dimension[0],:dimension[1],0], cmap="gray")
    plt.subplot(2,2,3)
    plt.imshow(edges[:dimension[0],:dimension[1],1], cmap='gray')
    plt.subplot(2,2,4)
    plt.imshow(edges[:dimension[0],:dimension[1],2], cmap='gray')
plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Ram Issues

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.811Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## HSV Transform
# Since this contest is about time series ordering, I think it's possible there may be useful information in a transform to HSV color space. HSV is useful for identifying shadows and illumination, as well as giving us a means to identify similar objects that are distinct by color between scenes (hue), though there's no guarantee the hue will be stable.

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Defective

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.811Z"},"jupyter":{"outputs_hidden":false}}
for path in df_defective['path'].head(4):
    image = cv2.imread(path)
    hsv = color.rgb2hsv(image)
    dimension = hsv.shape
    fig = plt.figure(figsize=(8, 8))
    plt.suptitle("Defective")
    plt.subplot(2,2,1)
    plt.imshow(image)
    plt.subplot(2,2,2)
    plt.imshow(hsv[:dimension[0],:dimension[1],0], cmap="PuBuGn")
    plt.subplot(2,2,3)
    plt.imshow(hsv[:dimension[0],:dimension[1],1], cmap='bone')
    plt.subplot(2,2,4)
    plt.imshow(hsv[:dimension[0],:dimension[1],2], cmap='bone')
plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Undefective

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.812Z"},"jupyter":{"outputs_hidden":false}}
for path in df_undefective['path'].head(4):
    image = cv2.imread(path)
    hsv = color.rgb2hsv(image)
    dimension = hsv.shape
    fig = plt.figure(figsize=(8, 8))
    plt.suptitle("Non defective")
    plt.subplot(2,2,1)
    plt.imshow(image)
    plt.subplot(2,2,2)
    plt.imshow(hsv[:dimension[0],:dimension[1],0], cmap="PuBuGn")
    plt.subplot(2,2,3)
    plt.imshow(hsv[:dimension[0],:dimension[1],1], cmap='bone')
    plt.subplot(2,2,4)
    plt.imshow(hsv[:dimension[0],:dimension[1],2], cmap='bone')
plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Ram Issues

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.812Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Corners

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.812Z"},"jupyter":{"outputs_hidden":false}}
def corners_images_gray(main_df, class_name):
    for idx,i in enumerate(np.random.choice(main_df['path'],4)):
        image = cv2.imread(i)
        gray=cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        corners_gray = cv2.goodFeaturesToTrack(gray, maxCorners=50, qualityLevel=0.02, minDistance=20)
        corners_gray = np.float32(corners_gray)
        for item in corners_gray:
            x, y = item[0]
            cv2.circle(image, (int(x), int(y)), 6, (0, 255, 0), -1)
        fig = plt.figure(figsize=(32, 32))
        plt.suptitle(class_name)
        plt.subplot(2,2,1)
        plt.imshow(image, cmap="BuGn")
        plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Defective

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.813Z"},"jupyter":{"outputs_hidden":false}}
corners_images_gray(df_defective, "Defective")

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Undefective

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.813Z"},"jupyter":{"outputs_hidden":false}}
corners_images_gray(df_undefective, "Undefective")

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Ram Issues

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.813Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Sift Features

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.814Z"},"jupyter":{"outputs_hidden":false}}
def sift_images_gray(main_df, class_name):
    for idx,i in enumerate(np.random.choice(main_df['path'],4)):
        image = cv2.imread(i)
        gray=cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        sift = cv2.SIFT_create()
        kp, des = sift.detectAndCompute(gray, None)
        kp_img = cv2.drawKeypoints(image, kp, None, color=(0, 255, 0), flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
        fig = plt.figure(figsize=(32, 32))
        plt.suptitle(class_name)
        plt.subplot(2,2,1)
        plt.imshow(kp_img, cmap="viridis")
        plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Defective

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.814Z"},"jupyter":{"outputs_hidden":false}}
sift_images_gray(df_defective, "Defective")

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Undefective

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.814Z"},"jupyter":{"outputs_hidden":false}}
sift_images_gray(df_undefective, "Undefective")

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Ram Issues

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.815Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## HOG

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.815Z"},"jupyter":{"outputs_hidden":false}}
def hog_images(main_df, class_name):
    for idx,i in enumerate(np.random.choice(main_df['path'],4)):
        image = cv2.imread(i)
        fd, hog_image = hog(image, orientations=9, pixels_per_cell=(8, 8), cells_per_block=(2, 2), visualize=True, multichannel=True)
        fig = plt.figure(figsize=(32, 32))
        plt.suptitle(class_name)
        plt.subplot(2,2,1)
        plt.imshow(hog_image, cmap="viridis")
        plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Defective

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.816Z"},"jupyter":{"outputs_hidden":false}}
hog_images(df_defective, "Defective")

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Undefective

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.816Z"},"jupyter":{"outputs_hidden":false}}
hog_images(df_undefective, "Undefective")

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Ram Issues

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.816Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# # Augmentations

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.817Z"},"jupyter":{"outputs_hidden":false}}
def plot_augimages(paths, datagen):
    plt.figure(figsize = (14,28))
    plt.suptitle('Augmented Images')
    
    midx = 0
    for path in paths:
        data = Image.open(path)
        data = data.resize((224,224))
        samples = expand_dims(data, 0)
        it = datagen.flow(samples, batch_size=1)
    
        # Show Original Image
        plt.subplot(10,5, midx+1)
        plt.imshow(data)
        plt.axis('off')
    
        # Show Augmented Images
        for idx, i in enumerate(range(4)):
            midx += 1
            plt.subplot(10,5, midx+1)
            
            batch = it.next()
            image = batch[0].astype('uint8')
            plt.imshow(image)
            plt.axis('off')
        midx += 1
    
    plt.tight_layout()
    plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Data Generators

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Test Generators

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.818Z"},"jupyter":{"outputs_hidden":false}}
test_datagen = ImageDataGenerator()
test_generator = test_datagen.flow_from_directory(
    directory="../input/railway-track-fault-detection/Railway Track fault Detection Updated/Test",
    target_size=(448, 448),
    color_mode="rgb",
    batch_size=32,
    class_mode="binary",
    shuffle=True,
    seed=42
)

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### VGG Generators

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.818Z"},"jupyter":{"outputs_hidden":false}}
from keras.applications.vgg16 import preprocess_input

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.819Z"},"jupyter":{"outputs_hidden":false}}
vgg_datagen = ImageDataGenerator(
    rotation_range=20,
    zoom_range=0.10,
    brightness_range=[0.6,1.4],
    channel_shift_range=0.7,
    width_shift_range=0.15,
    height_shift_range=0.15,
    shear_range=0.15,
    horizontal_flip=True,
    fill_mode='nearest',
    preprocessing_function=preprocess_input
) 
train_generator_vgg = vgg_datagen.flow_from_directory(
    directory="../input/railway-track-fault-detection/Railway Track fault Detection Updated/Train",
    target_size=(448, 448),
    color_mode="rgb",
    batch_size=32,
    class_mode="binary",
    shuffle=True,
    seed=42,
    
)
val_generator_vgg = vgg_datagen.flow_from_directory(
    directory="../input/railway-track-fault-detection/Railway Track fault Detection Updated/Validation",
    target_size=(448, 448),
    color_mode="rgb",
    batch_size=32,
    class_mode="binary",
    shuffle=True,
    seed=42,
)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.819Z"},"jupyter":{"outputs_hidden":false}}
plot_augimages(np.random.choice(df_defective['path'],10), vgg_datagen)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.819Z"},"jupyter":{"outputs_hidden":false}}
plot_augimages(np.random.choice(df_undefective['path'],10), vgg_datagen)

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Resnet50 Generators

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.819Z"},"jupyter":{"outputs_hidden":false}}
from tensorflow.keras.applications.resnet50 import preprocess_input

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.819Z"},"jupyter":{"outputs_hidden":false}}
resnet50_datagen = ImageDataGenerator(
    rotation_range=20,
    zoom_range=0.10,
    brightness_range=[0.6,1.4],
    channel_shift_range=0.7,
    width_shift_range=0.15,
    height_shift_range=0.15,
    shear_range=0.15,
    horizontal_flip=True,
    fill_mode='nearest',
    preprocessing_function=preprocess_input
) 
resnet50_train = resnet50_datagen.flow_from_directory(
    directory="../input/railway-track-fault-detection/Railway Track fault Detection Updated/Train",
    target_size=(448, 448),
    color_mode="rgb",
    batch_size=32,
    class_mode="binary",
    shuffle=True,
    seed=42,
    
)
resnet50_val = resnet50_datagen.flow_from_directory(
    directory="../input/railway-track-fault-detection/Railway Track fault Detection Updated/Validation",
    target_size=(448, 448),
    color_mode="rgb",
    batch_size=32,
    class_mode="binary",
    shuffle=True,
    seed=42,
)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.820Z"},"jupyter":{"outputs_hidden":false}}
plot_augimages(np.random.choice(df_defective['path'],10), resnet50_datagen)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.820Z"},"jupyter":{"outputs_hidden":false}}
plot_augimages(np.random.choice(df_undefective['path'],10), resnet50_datagen)

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### InceptionV3

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.821Z"},"jupyter":{"outputs_hidden":false}}
from tensorflow.keras.applications.inception_v3 import preprocess_input

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.821Z"},"jupyter":{"outputs_hidden":false}}
inception_v3_datagen = ImageDataGenerator(
    rotation_range=20,
    zoom_range=0.10,
    brightness_range=[0.6,1.4],
    channel_shift_range=0.7,
    width_shift_range=0.15,
    height_shift_range=0.15,
    shear_range=0.15,
    horizontal_flip=True,
    fill_mode='nearest',
    preprocessing_function=preprocess_input
) 
inception_v3_train = inception_v3_datagen.flow_from_directory(
    directory="../input/railway-track-fault-detection/Railway Track fault Detection Updated/Train",
    target_size=(448, 448),
    color_mode="rgb",
    batch_size=32,
    class_mode="binary",
    shuffle=True,
    seed=42,
    
)
inception_v3_val = inception_v3_datagen.flow_from_directory(
    directory="../input/railway-track-fault-detection/Railway Track fault Detection Updated/Validation",
    target_size=(448, 448),
    color_mode="rgb",
    batch_size=32,
    class_mode="binary",
    shuffle=True,
    seed=42,
)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.822Z"},"jupyter":{"outputs_hidden":false}}
plot_augimages(np.random.choice(df_defective['path'],10), inception_v3_datagen)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.823Z"},"jupyter":{"outputs_hidden":false}}
plot_augimages(np.random.choice(df_undefective['path'],10), inception_v3_datagen)

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# # Modelling

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## VGG-16

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.823Z"},"jupyter":{"outputs_hidden":false}}
# include_top = False means that we doesnt include fully connected top layer we will add them accordingly
vgg16 = VGG16(include_top = False, input_shape = (448,448,3), weights = 'imagenet')

# training of all the convolution is set to false
for layer in vgg16.layers:
    layer.trainable = False

x = GlobalAveragePooling2D()(vgg16.output)
predictions = Dense(1, activation='sigmoid')(x)

model_vgg = Model(inputs = vgg16.input, outputs = predictions)

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Resnet50

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.823Z"},"jupyter":{"outputs_hidden":false}}
resnet50 = ResNet50(include_top = False, input_shape = (448,448,3), weights = 'imagenet')

# training of all the convolution is set to false
for layer in resnet50.layers:
    layer.trainable = False

x = GlobalAveragePooling2D()(resnet50.output)
predictions = Dense(1, activation='sigmoid')(x)

model_resnet50 = Model(inputs = resnet50.input, outputs = predictions)

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Inception Net

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.824Z"},"jupyter":{"outputs_hidden":false}}
inceptionV3 = InceptionV3(include_top = False, input_shape = (448,448,3), weights = 'imagenet')

# training of all the convolution is set to false
for layer in inceptionV3.layers:
    layer.trainable = False

x = GlobalAveragePooling2D()(inceptionV3.output)
predictions = Dense(1, activation='sigmoid')(x)

model_inception_v3 = Model(inputs = inceptionV3.input, outputs = predictions)

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Ram Issues

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.824Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### VGG Compilation

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.824Z"},"jupyter":{"outputs_hidden":false}}
model_vgg.compile(loss='binary_crossentropy', optimizer="adam", metrics=['accuracy'])

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Resnet Compilation

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.825Z"},"jupyter":{"outputs_hidden":false}}
model_resnet50.compile(loss='binary_crossentropy', optimizer="adam", metrics=['accuracy'])

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### InceptionNet Compilation

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.825Z"},"jupyter":{"outputs_hidden":false}}
model_inception_v3.compile(loss='binary_crossentropy', optimizer="adam", metrics=['accuracy'])

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Fitting Vgg

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.826Z"},"jupyter":{"outputs_hidden":false}}
history_vgg = model_vgg.fit(
      train_generator_vgg,
      validation_data=val_generator_vgg,
      epochs=30,
      verbose=2)

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Fitting Resnet50

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.827Z"},"jupyter":{"outputs_hidden":false}}
history_resnet50 = model_resnet50.fit(
      resnet50_train,
      validation_data=resnet50_val,
      epochs=30,
      verbose=2)

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Fitting InceptionV3

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.827Z"},"jupyter":{"outputs_hidden":false}}
history_inception_v3 = model_inception_v3.fit(
      inception_v3_train,
      validation_data=inception_v3_val,
      epochs=30,
      verbose=2)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.827Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Analyzing perfomance of VGG

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.827Z"},"jupyter":{"outputs_hidden":false}}
plt.figure(figsize=(15,5))
plt.plot(history_vgg.history['accuracy'])
plt.plot(history_vgg.history['val_accuracy'])
plt.title('Model accuracy')
plt.ylabel('Accuracy')
plt.xlabel('Epoch')
plt.show()

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.827Z"},"jupyter":{"outputs_hidden":false}}
plt.figure(figsize=(15,5))
plt.plot(history_vgg.history['loss'])
plt.plot(history_vgg.history['val_loss'])
plt.title('Model loss')
plt.ylabel('loss')
plt.xlabel('Epoch')
plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Analyzing perfomance of Resnet50

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.828Z"},"jupyter":{"outputs_hidden":false}}
plt.figure(figsize=(15,5))
plt.plot(history_resnet50.history['accuracy'])
plt.plot(history_resnet50.history['val_accuracy'])
plt.title('Model accuracy')
plt.ylabel('Accuracy')
plt.xlabel('Epoch')
plt.show()

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.828Z"},"jupyter":{"outputs_hidden":false}}
plt.figure(figsize=(15,5))
plt.plot(history_resnet50.history['loss'])
plt.plot(history_resnet50.history['val_loss'])
plt.title('Model loss')
plt.ylabel('loss')
plt.xlabel('Epoch')
plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ### Analyzing perfomance of InceptionNetV3

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.829Z"},"jupyter":{"outputs_hidden":false}}
plt.figure(figsize=(15,5))
plt.plot(history_inception_v3.history['accuracy'])
plt.plot(history_inception_v3.history['val_accuracy'])
plt.title('Model accuracy')
plt.ylabel('Accuracy')
plt.xlabel('Epoch')
plt.show()

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.829Z"},"jupyter":{"outputs_hidden":false}}
plt.figure(figsize=(15,5))
plt.plot(history_inception_v3.history['loss'])
plt.plot(history_inception_v3.history['val_loss'])
plt.title('Model loss')
plt.ylabel('loss')
plt.xlabel('Epoch')
plt.show()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Ram Issues

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.830Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# # Explaniable AI

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Methods and utils

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.830Z"},"jupyter":{"outputs_hidden":false}}
def gradcam_visualise(data, model, class_index):
    explainer = SmoothGrad()
    output = explainer.explain(data, model, class_index=class_index)
    return output

def activation_visualise(image, model, layers):
    explainer = ExtractActivations()
    output = explainer.explain([image], model, layers_name=layers)
    return output

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.831Z"},"jupyter":{"outputs_hidden":false}}
def plot_data_eight(class_name, outputs):
    fig = plt.figure(figsize=(32, 32))
    plt.suptitle(class_name)
    plt.subplot(4,2,1)
    plt.imshow(outputs[0])
    plt.subplot(4,2,2)
    plt.imshow(outputs[1])
    plt.subplot(4,2,3)
    plt.imshow(outputs[2])
    plt.subplot(4,2,4)
    plt.imshow(outputs[3])
    plt.subplot(4,2,5)
    plt.imshow(outputs[4])
    plt.subplot(4,2,6)
    plt.imshow(outputs[5])
    plt.subplot(4,2,7)
    plt.imshow(outputs[6])
    plt.subplot(4,2,8)
    plt.imshow(outputs[7])
    plt.show()

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.831Z"},"jupyter":{"outputs_hidden":false}}
def grad_cam(model, df_exp, class_name, pre_process_input, class_index):
    output_data = []
    for idx,i in enumerate(np.random.choice(df_exp[0],8)):
        image = cv2.imread('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Test/'+class_name+'/'+i)
        image = cv2.resize(image, (448,448))
        image = pre_process_input(image)
        data = ([image], None)
        output = gradcam_visualise(data, model, class_index)
        output_data.append(output)
    plot_data_eight(class_name, output_data)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.832Z"},"jupyter":{"outputs_hidden":false}}
def activations_model(model, df_exp, class_name, pre_process_input, layers):
    output_data = []
    for idx,i in enumerate(np.random.choice(df_exp[0],8)):
        image = cv2.imread('../input/railway-track-fault-detection/Railway Track fault Detection Updated/Test/'+class_name+'/'+i)
        image = cv2.resize(image, (448,448))
        image = pre_process_input(image)
        image = tf.expand_dims(image, axis=0)
        output = activation_visualise([image], model, layers)
        output_data.append(output)
    plot_data_eight(class_name, output_data)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.832Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Resnet50

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.833Z"},"jupyter":{"outputs_hidden":false}}
from tensorflow.keras.applications.resnet50 import preprocess_input

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.833Z"},"jupyter":{"outputs_hidden":false}}
grad_cam(model_resnet50, test_df_undefective, "Non defective", preprocess_input, 0)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.833Z"},"jupyter":{"outputs_hidden":false}}
grad_cam(model_resnet50, test_df_defective, "Defective", preprocess_input, 1)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.834Z"},"jupyter":{"outputs_hidden":false}}
activations_model(model_resnet50, test_df_undefective, "Non defective", preprocess_input, [model_resnet50.layers[-3].name])

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.834Z"},"jupyter":{"outputs_hidden":false}}
activations_model(model_resnet50, test_df_defective, "Defective", preprocess_input, [model_resnet50.layers[-3].name])

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## VGG16

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.835Z"},"jupyter":{"outputs_hidden":false}}
from tensorflow.keras.applications.vgg16 import preprocess_input

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.835Z"},"jupyter":{"outputs_hidden":false}}
grad_cam(model_vgg, test_df_undefective, "Non defective", preprocess_input, 0)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.835Z"},"jupyter":{"outputs_hidden":false}}
grad_cam(model_vgg, test_df_defective, "Defective", preprocess_input, 1)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.836Z"},"jupyter":{"outputs_hidden":false}}
activations_model(model_vgg, test_df_undefective, "Non defective", preprocess_input, [model_vgg.layers[-3].name])

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.836Z"},"jupyter":{"outputs_hidden":false}}
activations_model(model_vgg, test_df_defective, "Defective", preprocess_input, [model_vgg.layers[-3].name])

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.837Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# ## Inception Module

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.838Z"},"jupyter":{"outputs_hidden":false}}
from tensorflow.keras.applications.inception_v3 import preprocess_input

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.839Z"},"jupyter":{"outputs_hidden":false}}
grad_cam(model_inception_v3, test_df_undefective, "Non defective", preprocess_input, 0)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.840Z"},"jupyter":{"outputs_hidden":false}}
grad_cam(model_inception_v3, test_df_defective, "Defective", preprocess_input, 1)

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.840Z"},"jupyter":{"outputs_hidden":false}}
activations_model(model_inception_v3, test_df_undefective, "Non defective", preprocess_input, [model_inception_v3.layers[-3].name])

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.841Z"},"jupyter":{"outputs_hidden":false}}
activations_model(model_inception_v3, test_df_defective, "Defective", preprocess_input, [model_inception_v3.layers[-3].name])

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.841Z"},"jupyter":{"outputs_hidden":false}}
gc.collect()

# %% [markdown] {"jupyter":{"outputs_hidden":false}}
# # Model Save

# %% [code] {"execution":{"execution_failed":"2025-09-16T18:33:41.842Z"},"jupyter":{"outputs_hidden":false}}
model_vgg.save('./model_vgg.h5')
model_resnet50.save('./model_resnet50.h5')
model_inception_v3.save('./model_inception_v3.h5')