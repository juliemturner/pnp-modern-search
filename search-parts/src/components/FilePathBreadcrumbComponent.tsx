import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { ITheme } from '@fluentui/react';
import { Breadcrumb, IBreadcrumbItem } from '@fluentui/react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

export interface IBreadcrumbProps {
    /**
     * Path from which breadcrumbs are formed from. This should ideally be the OriginalPath property of a SharePoint document, list item, folder, etc.
     */
    path?: string;

    /**
     * Determines whether the site name should be included in the breadcrumbs.
     */
    includeSiteName?: boolean;

    /**
     * Determines whether the item name should be included in the breadcrumbs.
     */
    includeItemName?: boolean;

    /**
     * Determines whether the breadcrumbs should be clickable links to the path they represent.
     */
    breadcrumbItemsAsLinks?: boolean;

    /**
     * The maximum number of breadcrumbs to display before coalescing. If not specified, all breadcrumbs will be rendered.
     */
    maxDisplayedItems?: number;

    /**
     * Index where overflow items will be collapsed.
     */
    overflowIndex?: number;

    /**
     * Font size for breadcrumbs.
     */
    fontSize?: number;

    /**
     * The current theme settings.
     */
    themeVariant?: IReadonlyTheme;
}

export interface IBreadcrumbState { }

const SITE_REGEX = /https:\/\/\w+\.sharepoint\.com\/sites\//;

export class FilePathBreadcrumb extends React.Component<IBreadcrumbProps, IBreadcrumbState> {

    static defaultProps = {
        includeSiteName: true,
        includeItemName: true,
        breadcrumbItemsAsLinks: true,
        maxDisplayedItems: 3,
        overflowIndex: 0,
        fontSize: 12
    };
    
    public render() {
        const { includeSiteName, includeItemName, breadcrumbItemsAsLinks, maxDisplayedItems, overflowIndex, fontSize, path, themeVariant } = this.props;

        const breadcrumbStyles = {
            root: {
                margin: '0',
            },
            item: {
                fontSize: `${fontSize}px`,
                padding: '1px',
            },
            itemLink: {
                fontSize: `${fontSize}px`,
                padding: '1px',
                selectors: {
                    ':hover': {
                        backgroundColor: 'unset'
                    },
                },
            },
        };

        return (
            <>
            {path !== undefined && this.validateFilePath(path) &&
                <Breadcrumb
                    items={this.getBreadcrumbItems(path, includeSiteName, includeItemName, breadcrumbItemsAsLinks)}
                    maxDisplayedItems={maxDisplayedItems}
                    overflowIndex={overflowIndex}
                    styles={breadcrumbStyles}
                    ariaLabel="Breadcrumb path"
                    overflowAriaLabel="More links"
                    theme={themeVariant as ITheme}
                />
            }
            </>
        )
    }

    // Validate that item path is SharePoint item path and not for example personal OneDrive item path.
    // For example:
    // SharePoint: https://m365xXYZ.sharepoint.com/sites/dev/SomeFolder/SomeFile.docx
    // OneDrive: https://m365xXYZ-my.sharepoint.com/personal/admin_m365xXYZ_onmicrosoft_com/Documents
    private validateFilePath = (path: string): boolean => {
        return SITE_REGEX.test(path);
    }

    private getBreadcrumbItems = (path: string, includeSiteName: boolean, includeItemName: boolean, breadcrumbItemsAsLinks: boolean): IBreadcrumbItem[] => {
        const frags = path.split('/');
        const index = frags.indexOf('sites');
        const basePath = frags.slice(0, index + 1).join('/');
        
        const breadcrumbNodes = this.getBreadcrumbNodes(frags, index, includeSiteName, includeItemName);
        
        const breadcrumbItems = breadcrumbNodes.map((frag, index) => {
            const item: IBreadcrumbItem = {
                text: frag,
                key: `item${index + 1}`,
                isCurrentItem: false
            };

            if (breadcrumbItemsAsLinks) {
                item.href = basePath + '/' + breadcrumbNodes.slice(0, index + 1).join('/');
            }

            return item;
        });
         
        return breadcrumbItems;
    }

    private getBreadcrumbNodes = (frags: string[], index: number, includeSiteName: boolean, includeItemName: boolean) => {
        const breadcrumbNodes = includeSiteName ? frags.slice(index + 1) : frags.slice(index + 2);
        
        return includeItemName ? breadcrumbNodes : breadcrumbNodes.slice(0, breadcrumbNodes.length - 1);
    }
}

export class FilePathBreadcrumbWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {
        let props = this.resolveAttributes();
        const filePathBreadcrumb = <div style={{ display: 'flex' }}><FilePathBreadcrumb {...props} /></div>;
        ReactDOM.render(filePathBreadcrumb, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}