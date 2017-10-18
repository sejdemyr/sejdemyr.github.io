# Set working directory  
setwd("/Users/simonejdemyr/dropbox/data-visualization/8-map")

# Load required libraries (install first if haven't already)
library(rgdal)
library(ggplot2)
library(plyr)
library(dplyr)

# Define function for writing system code (invoking the terminal) over several lines 
s <- function(cmd) system( strwrap(cmd, simplify=T, width=10000) )

# Read in the UN cartography polygon shapefile (no antarctica) 
world.un <- readOGR(dsn = "unmap", "un-world-2012-no-antartica") 

head(input.data)

# Add data to map
input.data <- read.csv("input/mortalitydta.csv", stringsAsFactor = F) %>%
    rename(ISO3_CODE = ISO3Code, country = CountryName)
world.un@data <- plyr::join(world.un@data, input.data, by = "ISO3_CODE", type = "left")

# Greenland gets Denmark's data
tempno <- which(world.un@data$TERR_NAME == "Greenland")
world.un@data[tempno, ] <- world.un@data[with(world.un@data, country == "Denmark" & !country %in% NA), ]
world.un@data[tempno, "country"] <- "Greenland (Data from Denmark displayed)" 

# Add coordinates for centroid
world.un@data$lon <- coordinates(world.un)[, 1]
world.un@data$lat <- coordinates(world.un)[, 2]

world.un$lon <- with(world.un@data, ifelse(STATUS == "Member State", lon, NA))
world.un[world.un$lon %in% NA, c("lat", "u5mr", "u5deaths")] <- NA

# Write to shape 
writeOGR(world.un, dsn = ".", "polygons", driver="ESRI Shapefile") 

# Create topojson file (also include lakes) 
s("topojson -o world.json           
            -p country,+lon,+lat,+u5mr,+u5deaths,+arr9015,+u5mrproj,+u5dproj
            --simplify-proportion 0.2
            -- polygons.shp
               lks=unmap/2012_UNGIWG_lks_ply_01.shp
            && rm polygons*")



# Read in the Un Cartography shapefile with country/area boundaries
bnd <- readOGR(dsn = "unmap", "2012_UNGIWG_bnd_ln_01") 

# Create dataframe from coordinates and cartograph info stored in @data
bnd.coord <- coordinates(bnd)
bnd.coord[[193]] <- do.call(rbind, bnd.coord[[193]]) #one element has several lists: collapse
n <- length(bnd.coord)

for(i in 1:n) {
    bnd.coord[[i]] <- data.frame(bnd.coord[[i]])
    names(bnd.coord[[i]]) <- c("lon", "lat")
    bnd.coord[[i]]$cartograph <- bnd@data$CARTOGRAPH[i]
    bnd.coord[[i]]$id <- i
}

# Collapse to dataframe and drop borders that are not needed
# Note: we'll set the solid line as an attribute of the polygons, so can drop here
bnd.coord <- do.call(rbind, bnd.coord) %>%
    filter(!cartograph %in% c("Not represented", "International boundary line"))

# Relabel cartograph to two types
bnd.coord$cartograph <- factor(bnd.coord$cartograph)
levels(bnd.coord$cartograph) <- c("dashed", "dotted", "dotted", "dashed")

# Write to csv
write.csv(bnd.coord, "boundaries.csv", row.names = F)







#bnd=unmap/2012_UNGIWG_bnd_ln_01.shp
#coast=unmap/2012_UNGIWG_cst_ln_01.shp
          

# Description of each line in the above command (which invokes the terminal): 
#   L1  name of the output topojson file
#   L2  variable (property) names
#   L3  shrinks the file by simplifying boundaries
#   L4- specifies the name of the input shape files
#   L8  removes unneded shape files 





world.un$lon <- with(world.un@data, ifelse(
    !u5deaths %in% NA & !ISO3_CODE %in% c(NA, "TWN", "XXX") &
    !M49COLOR %in% c(136, 238, 574, "PT Territory") &
    TERR_NAME !="Gaza Strip" & STATUS != "Occupied Palestinan Territory", lon, NA))

world.un$lat <- with(world.un@data, ifelse(lon %in% NA, NA, lat))
world.un$country <- with(world.un@data, ifelse(lon %in% NA, NA, country))














# OLD 
#---------------
# Read in the Un Cartography shapefile with lakes
  lks.un <- readOGR(map.dir, "2012_UNGIWG_lks_ply_01") 

# Read in the Un Cartography shapefile with coastlines
  cst.un <- readOGR(map.dir, "2012_UNGIWG_cst_ln_01") 
  # convert to Robinson projection 
  proj4string(cst.un) <- CRS("+proj=longlat +ellps=WGS84")
  cst <- spTransform(cst.un, CRS("+proj=robin"))
  # remove Antarctica -- this is a bit clunky, but it works
  cst.df <- fortify(cst)
  cst.df <- cst.df[cst.df$lat>=-6285430,]
  cst.df$colorcode <- boundary.color
  cst.df <- cst.df[,c("id","colorcode")]
  cst.df$id <- as.numeric(cst.df$id)
  cst.df <- unique(cst.df)
  names(cst.df) <- c("OBJECTID","colorcode")
  cst <- merge(cst,cst.df,by="OBJECTID",all.x=FALSE,all.y=TRUE)


# Read in the Un Cartography shapefile with Antarctica
  wld.un <- readOGR(map.dir, "un-world-2012") 
  ant.un <- wld.un[wld.un$TERR_NAME=="Antarctica",]
  rm(wld.un)
  # convert to Robinson projection 
  proj4string(ant.un) <- CRS("+proj=longlat +ellps=WGS84")
  ant <- spTransform(ant.un, CRS("+proj=robin"))
  ant.df <- fortify(ant)
  ant.df$color.code <- NA
  if (plot.coastlines==TRUE){ ant.df$color.code <- boundary.color }
  


dir()

plot(world.robin)



  # get centroid of country polygons
  n.places <- length(world.robin$vartomap2)
  places <- data.frame(matrix(ncol = 6, nrow = n.places))
  colnames(places) <- c("ISO3", "TERR_NAME", "long", "lat", "vartomap", "STATUS")
  
  places$ISO3 <- world.robin$ISO3_CODE
  places$TERR_NAME <- world.robin$TERR_NAME
  places$long <- coordinates(world.robin)[, 1]
  places$lat <- coordinates(world.robin)[, 2]
  places$vartomap <- world.robin$vartomap2
  places$STATUS <- world.robin$STATUS
  tmp <- subset(indata, select=c(M49COLOR, ISO3Code))
  places <- merge(places, tmp, by.x="ISO3", by.y="ISO3Code", all.x=FALSE, all.y=FALSE)

  head(places)
  

# assign colors to each category to be mapped
  ## colors <- brewer.pal(NumOfCategories+1,color.palette) # (requires RColorBrewer package) 
  colors <- brewer.pal(NumOfCategories,color.palette) # (requires RColorBrewer package) 
  ## colors <- colors[2:length(colors)] # eliminate the lightest hue as it tends not to map well (looks white in many palettes)
  colors <- colors[1:length(colors)] # eliminate the lightest hue as it tends not to map well (looks white in many palettes)
  colors <- rev(colors) # put the darkest hues first
  world.robin$colorcode <- NA
  for (i in 1:NumOfCategories){
    if (i==1){
      world.robin$colorcode[which(!is.na(world.robin$vartomap) & world.robin$vartomap>=category.breaks[1])] <- colors[1]
      } else if (i>1 & i<NumOfCategories) {
      world.robin$colorcode[which(!is.na(world.robin$vartomap) & world.robin$vartomap<category.breaks[i-1] & 
                                world.robin$vartomap>=category.breaks[i])] <- colors[i]
      } else if (i==NumOfCategories) {
      world.robin$colorcode[which(!is.na(world.robin$vartomap) & world.robin$vartomap<category.breaks[i-1])] <- colors[i]
      }
  }
  world.robin$colorcode[which(is.na(world.robin$vartomap))] <- NoDataColor

# UN Cartography requires that the Askai Chin region be striped half in the color of China and half in the color of 
# Jammu-Kashmir (no data for most of UNPD purposes)
# to do that, we create a separate polygon file that contains only the single region Aksai Chin and assign it the color of China for now
# it will be layered on top of the map in a separate step
  ac <- world.robin[world.robin$TERR_NAME=="Aksai Chin",]
  acf <- fortify(ac) # transform to data frame for more plotting options
  acf$colorcode <- world.robin$colorcode[which(world.robin$TERR_NAME=="China")]

# three styles of boundaries should be mapped: standard solid line, dashed line for undetermined boundaries, dotted for selected disputed boundaries
# to do that, we create a separate dataframe with each containing boundaries of the same type
  bnd.line <- bnd[bnd$CARTOGRAPH=="International boundary line",]
  bnd.dash <- bnd[bnd$CARTOGRAPH=="Dashed boundary line" | bnd$CARTOGRAPH=="Undetermined international dashed boundary line",]
  bnd.dot <- bnd[bnd$CARTOGRAPH=="Dotted boundary line" | bnd$CARTOGRAPH=="Dotted boundary line (Abyei)",]


# write the map function
  unpd.map <- function(){
    plot(world.robin,border=NA,col=world.robin$colorcode,bg=background.color) # plot country/area polygons
    polygon(acf$long,acf$lat,col=acf$colorcode[1],border=NA, density=130,angle=45,lwd=0.4) # plot Aksai Chin as striped region per UN Cartography requirements
    lines(bnd.line, col=boundary.color, lwd=0.2, lty=1) # plot solid boundaries
    lines(bnd.dash, col=boundary.color, lwd=0.2, lty=2) # plot dashed boundaries
    lines(bnd.dot, col=boundary.color, lwd=0.2, lty=3) # plot dotted boundaries
    
    if (plot.lakes==TRUE) {
      lks.grp <- unique(lks.df$group)
      for (gp in lks.grp) {
        lk <- lks.df[lks.df$group==gp,]
         polygon(lk$long,lk$lat,col=background.color,border=boundary.color,lty=1,lwd=0.2) # plot lakes as background color
      }
    }
    if (plot.coastlines==TRUE) {
      lines(cst, col=boundary.color, lwd=0.2, lty=1) # plot coastlines as solid lines
      
    }
    if (plot.antarctica==TRUE) {
      ant.grp <- unique(ant.df$group)
      for (gp in ant.grp) {
        ant <- ant.df[ant.df$group==gp,]
        polygon(ant$long,ant$lat,col=NoDataColor,border=ant$color.code,lty=1,lwd=0.2)
      }
    }
    
		
	## add point layer
	library(mapplots)
	# define transparency function for named colors:
	colalpha <- function(color,alpha){
	 colalphai <- function(color,alpha){
	      paste(rgb(t(col2rgb(color)/255)),alpha,sep="")
		  }
	sapply(color,colalphai,alpha=alpha)
	}

	places2 <- subset(places, is.na(places$vartomap)==FALSE 
	& places$ISO3!="TWN" & places$ISO3!="XXX" & places$M49COLOR!= 136 & places$M49COLOR!= 238 & places$STATUS != "Sovereignty unsettled" & places$M49COLOR!= 574 
	& places$M49COLOR != "PT Territory" & places$TERR_NAME !="Gaza Strip" & places$STATUS != "Occupied Palestinan Territory")
	places2 <- places2[order(-places2$vartomap),]
	draw.bubble(places2$long, places2$lat, places2$vartomap, maxradius=700000, pch=21, bg=colalpha("grey",90))
	
    ## library(maptools) 
	## Label points to avoid overlaps using maptools function (simulated annealing optimization method)
	## pointLabel(places2$long, places2$lat, places2$ISO3, method = "SANN", offset = 0, cex = .2)

	## alternative
	## radius <- sqrt( places$vartomap / pi ) 
	## symbols(places$long, places$lat, circles=radius, inches=0.35, fg="white", bg="red")
	## symbols(places$long, places$lat, squares=sqrt(places$vartomap), inches=0.5)


    ## text(0,10000000, main.title, cex=0.8) # main title
    
    legend(-16820000, -1000000, col=c(colors, NoDataColor), pt.bg=c(colors, NoDataColor), pch=15, pt.cex=2, cex=0.7, 
           legend=legend.labels,
           title=legend.title, box.lty=0, box.col="white",
		   bty='o', bg='white')

	text(-16820000*0.6, -2500000, "Under-five deaths\n(in million)", cex=0.7)
	legend.bubble(-16820000*0.6, -4000000, z=max(places2$vartomap)/1000000, n=5, round = 1, maxradius=700000, 
					bty="n", inset=0.01, txt.cex=0.4, pch=21, pt.bg=colalpha("red",95), bg= "white")  
		   
    # UN Cartography required disclaimers
    ## mtext(paste(source.text,"\n",disclaimer.text,sep=""), side=1,line=0,adj=0,cex=0.5)
  }

# Create the maps and save them to pdf and png output files

  # Use this low resolution png file for web displays 
  png(file = paste(out.dir,map.name,"_LowResForWeb4.png",sep=""),width=10,height=4.5,units="in",res=100)
  ## par(oma=c(0,0,0,0)) # no margins
  ## oma defines the space in lines, omd as a fraction of the device region, omi specifies the size in inches. 
  ## oma and omi take a four item vector where position one sets the bottom margin, position two the left margin, position three the top margin and position four the right margin. 
  ## The mar command represents the figure margins. The vector is in the same ordering of  the oma commands.  
  ## http://rgraphics.limnology.wisc.edu/rmargins_sf.php
  ## par(mfrow = c(1,1), omi=c(0.04,0.04,0.04,0.04), mar=c(0,0,0,0)+0.1, mgp=c(2,0.5,0),
  par(mfrow = c(1,1), omi=c(0,0,0,0), mar=c(0,0,0,0), mgp=c(2,0.5,0),
      las=0, mex=1, cex=1, cex.main=1, cex.lab=1, cex.axis=1)
  unpd.map()
  dev.off() # close the png

  # Use this higher resolution png file for inserting into Word documents
  png(file = paste(out.dir,map.name,"_HighResForWord.png",sep=""),width=10,height=4.5,units="in",res=1000)
  par(mfrow = c(1,1), omi=c(0,0,0,0), mar=c(0,0,0,0), mgp=c(2,0.5,0),
      las=0, mex=1, cex=1, cex.main=1, cex.lab=1, cex.axis=1)
  unpd.map()
  dev.off() # close the png

  # Use the pdf file for pubs going through the Graphic Design Unit
  pdf(file = paste(out.dir,map.name,".pdf",sep=""),width=10,height=4.5)
  par(mfrow = c(1,1), omi=c(0,0,0,0), mar=c(0,0,0,0), mgp=c(2,0.5,0),
      las=0, mex=1, cex=1, cex.main=1, cex.lab=1, cex.axis=1)
  unpd.map()
  dev.off() # close the pdf
