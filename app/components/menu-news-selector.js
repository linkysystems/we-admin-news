import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service('store'),
  addLink: 'addLink',
  isLoading: true,
  selectedPage: null,
  pagesSelected: null,
  havePagesSelected: false,

  recentPages: null,

  didInsertElement() {
    return this.get('store').query('news', {
      limit: 8,
      order: 'createdAt DESC'
    }).then( (recentPages)=> {
      this.set('recentPages', recentPages);
      this.set('isLoading', false);
      return null;
    })
    .catch(()=> {
      // TODO!
    });
  },

  actions: {
    searchPages(term) {
      return this.get('store').query('news', {
        'title_starts-with': term,
        limit: 10
      });
    },
    selectPage(page) {
      this.set('selectedPage', page);
    },

    pageChecked(page) {
      let pagesSelected = this.get('pagesSelected');
      if (!pagesSelected) {
        pagesSelected = {};
        this.set('pagesSelected', pagesSelected);
      }
      // toggle page selection:
      if (pagesSelected[page.id]) {
        delete pagesSelected[page.id];
      } else {
        pagesSelected[page.id] = page;
      }

      this.set('havePagesSelected', Boolean(Object.keys(pagesSelected).length));
    },

    addPage() {
      let selectedPage = this.get('selectedPage');
      if (selectedPage && selectedPage.get('linkPermanent')) {
        let link = this.buildLink( selectedPage );
        this.sendAction('addLink', link);
        this.set('selectedPage', null);
      }
    },

    listaChecked() {
      let pagesSelected = this.get('pagesSelected');
      if (!pagesSelected) {
        pagesSelected = {};
        this.set('pagesSelected', pagesSelected);
      }
      // toggle page selection:
      if (pagesSelected['news_list']) {
        delete pagesSelected['news_list'];
      } else {
        pagesSelected['news_list'] = {
          isList: true,
          linkPermanent: '/news'
        };
      }

      this.set('havePagesSelected', Boolean(Object.keys(pagesSelected).length));
    },

    addPages() {
      const pagesSelected = this.get('pagesSelected');

      for (let id in pagesSelected) {
        let link;

        if (pagesSelected[id].isList) {
          link = this.buildListLink( pagesSelected[id] );
        } else {
          link = this.buildLink( pagesSelected[id] );
        }
        delete pagesSelected[id];
        this.sendAction('addLink', link);
      }

      this.set('havePagesSelected', false);
      this.$('input[type=checkbox]').removeAttr('checked');
    }
  },

  buildLink(selected) {
    let linkPermanent = selected.get('linkPermanent');

    let link = this.get('store').createRecord('link', {
      text: selected.get('title'),
      modelName: 'news',
      modelId: selected.id,
      href: linkPermanent
    });

    return link;
  },

  buildListLink() {
    let link = this.get('store').createRecord('link', {
      type: 'list',
      text: 'Notícias',
      href: '/news'
    });

    return link;
  }
});