//
//  SafariExtensionViewController.m
//  github-colorizer-safari
//
//  Created by Christoffer Tønnessen on 06/08/2018.
//  Copyright © 2018 ninjadev. All rights reserved.
//

#import "SafariExtensionViewController.h"

@interface SafariExtensionViewController ()

@end

@implementation SafariExtensionViewController

+ (SafariExtensionViewController *)sharedController {
    static SafariExtensionViewController *sharedController = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedController = [[SafariExtensionViewController alloc] init];
    });
    return sharedController;
}

@end
