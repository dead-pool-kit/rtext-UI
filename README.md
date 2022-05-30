# rtext-UI
UI for R-text

![Screen Shot 2022-05-29 at 8 38 57 PM](https://user-images.githubusercontent.com/44551022/170913037-f7d1ea49-0d7b-4a15-b230-2c2c84acbdec.png)


How to Start:

Pull from the git source, go to the source folder and run python (version 3 or greater) app.py  with command line args:

Example:
python3 app.py data/HILS_SWLS_100_pp.csv word_data.dot.x word_data.dot.y word_data.words word_data.n

(This file is already in the source folder)
arg1: path to csv file
arg2: x-coordinate
arg3: y-coordinate
arg4: word to be plotted in the cloud
arg5: number of occurrence of that word


Run localhost:8005 on your browser.


Sliders:

  Sample Size: Number of words you want to be plotted on the space with the step function of 10.
    
Number of clusters: In how many clusters you want the words to be segregated in. (Have used K-means clustering as of now with default as 3)


SearchBox:
 To find the embedding of any word on our projection map. The word could be present or not. If not, it'll give you an alert. 

