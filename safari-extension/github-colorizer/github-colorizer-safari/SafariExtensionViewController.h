//
//  SafariExtensionViewController.h
//  github-colorizer-safari
//
//  Created by Christoffer Tønnessen on 06/08/2018.
//  Copyright © 2018 ninjadev. All rights reserved.
//

#import <SafariServices/SafariServices.h>

@interface SafariExtensionViewController : SFSafariExtensionViewController

+ (SafariExtensionViewController *)sharedController;

@end
